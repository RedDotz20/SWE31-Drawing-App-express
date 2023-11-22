import express from 'express';
import { createNewUsername, loadTestUsers } from './testTable.controller';

export const testTableRouter = express.Router();

testTableRouter.post('/createUsername', createNewUsername);
testTableRouter.get('/getUsername', loadTestUsers);
