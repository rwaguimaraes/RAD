import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import db from './db';
import { signToken, verifyToken } from './token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get current user from request cookies
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  // Verify user still exists in database
  const user = db.prepare('SELECT id, username, email, avatar_color FROM users WHERE id = ?').get(payload.userId) as { id: string; username: string; email: string; avatar_color: string } | undefined;
  if (!user) return null;
  
  return user;
}

export { signToken, verifyToken };
