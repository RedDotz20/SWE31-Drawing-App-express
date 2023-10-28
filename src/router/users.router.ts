import express from 'express';
import * as UserController from './users.controller';

export const userRouter = express.Router();

userRouter.get('/getusers', UserController.getUsersController);
