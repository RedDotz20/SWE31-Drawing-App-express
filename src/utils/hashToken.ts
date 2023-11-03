import crypto from 'crypto';

//? Used to Hash the token before saving it to the database.
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
