import express, { NextFunction, Request, Response } from 'express';
import bycrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { hashToken } from '../../utils/hashToken';

import { generateTokens } from '../../utils/jwt';

import {
  findUserByUsername,
  createUserByUsernameAndPassword,
  findUserById,
} from '../users/user.service';

import {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens,
} from './auth.service';

import { loginUser } from './auth.controller';

const router = express.Router();

router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400);
        throw new Error('You must provide an email and a password.');
      }

      const existingUser = await findUserByUsername(username);

      if (existingUser) {
        res.status(400);
        throw new Error('Username already in use.');
      }

      const user = await createUserByUsernameAndPassword({
        username,
        password,
      });

      const jti = uuidv4();
      const { accessToken, refreshToken } = generateTokens(user, jti);

      await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

      res.json({ accessToken, refreshToken });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/login', loginUser);

router.post('/refreshToken', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      res.status(500);
      throw new Error('JWT_REFRESH_SECRET is not defined.');
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    ) as JwtPayload;

    const savedRefreshToken = await findRefreshTokenById(payload.jti);
    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user,
      jti
    );

    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
router.post('/revokeRefreshTokens', async (req, res, next) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
