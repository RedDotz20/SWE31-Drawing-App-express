import express, { Request, Response, NextFunction } from 'express';
import middleware from '../../middleware';
import { findUserById } from './user.service';

const router = express.Router();

// router.get(
//   '/profile',
//   middleware.isAuthenticated,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { userId } = req.payload as { userId: string };
//       const user = await findUserById(userId);
//       delete user.password;
//       res.json(user);
//     } catch (err) {
//       next(err);
//     }
//   }
// );

export default router;
