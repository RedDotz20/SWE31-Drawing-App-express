import express from 'express';
import {
  createCanvas,
  loadUserCanvas,
  deleteCanvas,
} from './canvas.controller';

export const canvasRouter = express.Router();

canvasRouter.post('/createCanvas', createCanvas);
canvasRouter.get('/loadUserCanvas', loadUserCanvas);
canvasRouter.delete('/deleteCanvas', deleteCanvas);
