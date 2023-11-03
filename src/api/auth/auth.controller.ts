import express, { NextFunction, Request, Response } from 'express';
import bycrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import {
  findUserByUsername,
  createUserByUsernameAndPassword,
  findUserById,
} from '../users/user.service';
import { addRefreshTokenToWhitelist } from './auth.service';
import { hashToken } from '../../utils/hashToken';
import { generateTokens } from '../../utils/jwt';

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
}

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
  } catch (err) {
    next(err);
  }
}
