import { authenticateUser } from './db';

export async function isAdmin(userId: string) {
  const user = await authenticateUser(userId);
  return user?.role === 'admin';
}