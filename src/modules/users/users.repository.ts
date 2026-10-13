import { eq, or } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { users, type User } from '../../models/user.model.js';

export interface CreateUserData {
  email: string;
  username: string;
}

export class UsersRepository {
  async findById(id: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return result ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return result ?? null;
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: or(eq(users.email, identifier), eq(users.username, identifier)),
    });
    return result ?? null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });
    return result !== undefined;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
      columns: { id: true },
    });
    return result !== undefined;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  }
}

export const usersRepository = new UsersRepository();
