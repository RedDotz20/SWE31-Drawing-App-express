import jwt, { Secret } from 'jsonwebtoken';

const generateAccessToken = (user: { id: string }) => {
  //? keep the token between 5 minutes or 15 minutes
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET as Secret,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
  );
};

const generateRefreshToken = (user: { id: string }, jti: string) => {
  return jwt.sign(
    { userId: user.id, jti },
    process.env.JWT_REFRESH_SECRET as Secret,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN }
  );
};

const generateTokens = (user: { id: string }, jti: string) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);
  return { accessToken, refreshToken };
};

export { generateAccessToken, generateRefreshToken, generateTokens };
