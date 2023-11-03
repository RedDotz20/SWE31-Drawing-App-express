import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import middleware from './middleware';
import { userRouter } from './router/users.router';

export const app: Application = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));

//? Server Routes
app.use('/api/users', userRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use(middleware.notFound);
app.use(middleware.errorHandler);
