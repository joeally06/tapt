import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const db = createClient({
  url: 'file:conference.db'
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(email: string, password: string, role: string = 'user') {
  const hashedPassword = await hashPassword(password);
  const id = 'user-' + Math.random().toString(36).substr(2, 9);

  await db.execute({
    sql: `INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)`,
    args: [id, email, hashedPassword, role]
  });

  return { id, email, role };
}

export async function authenticateUser(email: string, password: string) {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });

  const user = result.rows[0];
  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}

export async function isAdmin(userId: string) {
  const result = await db.execute({
    sql: 'SELECT role FROM users WHERE id = ?',
    args: [userId]
  });
  
  return result.rows[0]?.role === 'admin';
}