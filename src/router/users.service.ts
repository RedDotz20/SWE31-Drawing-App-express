import { db } from '../config/config';

export type Users = {
  id: number;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export const getUsers = async (): Promise<Users[]> => {
  return await db.users.findMany({
    select: {
      id: true,
      username: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
