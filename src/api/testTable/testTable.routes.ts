import express from 'express';
import { createNewUsername } from './testTable.controller';

export const testTableRouter = express.Router();

testTableRouter.post('/createUsername', createNewUsername);
// userRouter.get('/getusers', UserController.getUsersController);
