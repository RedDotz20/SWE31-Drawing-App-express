import express from 'express';
import {
  loginUser,
  registerUser,
  refreshToken,
  revokeRefreshToken,
} from './auth.controller';

export const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refreshToken', refreshToken);

router.post('/revokeRefreshTokens', revokeRefreshToken);

// module.exports = router;
