// import express, { Request, Response } from 'express';
// import * as UserService from './users.service';
// import { db } from '../config/config';

// export const getUsersController = async (
//   request: Request,
//   response: Response
// ): Promise<Response> => {
//   try {
//     const users = await UserService.getUsers();
//     return response.status(200).json({ users });
//   } catch (err: any) {
//   } finally {
//     async () => await db.$disconnect();
//   }
//   return response.status(500).json({ message: 'Internal Server Error' });
// };
