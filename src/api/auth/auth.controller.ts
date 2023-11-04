import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bycrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  findRefreshTokenById,
  addRefreshTokenToWhitelist,
  deleteRefreshToken,
  revokeTokens,
} from './auth.service';
import {
  findUserByUsername,
  createUserByUsernameAndPassword,
  findUserById,
} from '../users/user.service';
import { generateTokens } from '../../utils/jwt';
import { hashToken } from '../../utils/hashToken';

dotenv.config();

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    //? check password and username are provided
    if (!username || !password) {
      res.status(400);
      throw new Error('You must provide a username and a password.');
    }

    //? check if user exists in database
    const existingUser = await findUserByUsername(username);

    if (!existingUser) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    //? check if password is valid
    const validPassword = await bycrypt.compare(
      password,
      existingUser.password
    );

    if (!validPassword) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    //? Generate UUID for refresh/access token
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);

    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    //? check password and username are provided
    if (!username || !password) {
      res.status(400);
      throw new Error('You must provide a username and password.');
    }

    const existingUser = await findUserByUsername(username);

    //? check if user exists in database
    if (existingUser) {
      res.status(400);
      throw new Error('Username already in use.');
    }

    const user = await createUserByUsernameAndPassword({
      username,
      password,
    });

    //? Generate UUID for refresh/access token
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);

    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    if (payload.jti) {
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
    }
  } catch (err) {
    next(err);
  }
};

export const revokeRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
};
