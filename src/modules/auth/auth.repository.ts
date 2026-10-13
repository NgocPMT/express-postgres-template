import { and, eq } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { accounts, type Account, type AuthProvider } from '../../models/account.model.js';

export interface CreateAccountData {
  userId: string;
  provider: AuthProvider;
  passwordHash?: string;
  providerAccountId?: string;
}

export class AuthRepository {
  async createAccount(data: CreateAccountData): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values({
        userId: data.userId,
        provider: data.provider,
        passwordHash: data.passwordHash,
        providerAccountId: data.providerAccountId,
      })
      .returning();

    if (!account) {
      throw new Error('Failed to create account');
    }
    return account;
  }

  async findLocalAccountByUserId(userId: string): Promise<Account | null> {
    const result = await db.query.accounts.findFirst({
      where: and(eq(accounts.userId, userId), eq(accounts.provider, 'local')),
    });
    return result ?? null;
  }

  async findAccountByProvider(
    provider: AuthProvider,
    providerAccountId: string,
  ): Promise<Account | null> {
    const result = await db.query.accounts.findFirst({
      where: and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)),
    });
    return result ?? null;
  }
}

export const authRepository = new AuthRepository();
