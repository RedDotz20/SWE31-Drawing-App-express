import bycrypt from 'bcryptjs';
import { db } from '../../config/config';

type userType = {
  username: string;
  password: string;
};

export function findUserByUsername(username: string) {
  return db.user.findUnique({
    where: { username },
  });
}

export function createUserByUsernameAndPassword(user: userType) {
  user.password = bycrypt.hashSync(user.password, 12);
  return db.user.create({
    data: {
      username: user.username,
      password: user.password,
    },
  });
}

export function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
  });
}
