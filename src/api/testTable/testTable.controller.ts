import { Request, Response } from 'express';
import { db } from '../../config/config';

export const createNewUsername = async (req: Request, res: Response) => {
  try {
    const createdUser = await db.testTable.create({
      data: { username: req.body.username },
    });

    res.status(200).json({
      message: 'User created successfully',
      user: createdUser,
    });
  } catch (error) {
    console.error('Error creating username:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const loadTestUsers = async (req: Request, res: Response) => {
  try {
    const loadUsers = await db.testTable.findMany();
    res.status(200).json({
      message: 'TestUsers Loaded Successfully',
      data: loadUsers,
    });
  } catch (error) {
    console.error('Error loading users: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
