import { describe, expect, it, vi, beforeEach } from 'vitest';

import { UsersService } from '../../../src/modules/users/users.service.js';
import type { UsersRepository } from '../../../src/modules/users/users.repository.js';
import type { User } from '../../../src/models/user.model.js';

describe('UsersService', () => {
  let mockRepo: Partial<UsersRepository>;
  let usersService: UsersService;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByIdentifier: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      existsByEmail: vi.fn(),
      existsByUsername: vi.fn(),
      createUser: vi.fn(),
    };
    usersService = new UsersService(mockRepo as UsersRepository);
  });

  describe('getUserById', () => {
    it('returns user DTO when user exists', async () => {
      const mockUser: User = {
        id: '018f6e72-23b0-7e28-9f20-b42e77b4a1a3',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        status: 'active',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      mockRepo.findById = vi.fn().mockResolvedValue(mockUser);

      const result = await usersService.getUserById('018f6e72-23b0-7e28-9f20-b42e77b4a1a3');

      expect(result.id).toBe('018f6e72-23b0-7e28-9f20-b42e77b4a1a3');
      expect(result.email).toBe('test@example.com');
      expect(result.username).toBe('testuser');
      expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });

    it('throws 404 when user does not exist', async () => {
      mockRepo.findById = vi.fn().mockResolvedValue(null);

      await expect(usersService.getUserById('nonexistent-id')).rejects.toThrow('User not found');
    });
  });

  describe('findByIdentifier', () => {
    it('delegates to repository.findByIdentifier', async () => {
      const mockUser = { id: '018f6e72-23b0-7e28-9f20-b42e77b4a1a3', email: 'test@example.com', username: 'testuser' };
      mockRepo.findByIdentifier = vi.fn().mockResolvedValue(mockUser as never);

      const result = await usersService.findByIdentifier('testuser');

      expect(mockRepo.findByIdentifier).toHaveBeenCalledWith('testuser');
      expect(result).toBe(mockUser);
    });
  });

  describe('createUser', () => {
    it('delegates to repository.createUser', async () => {
      const input = { email: 'new@example.com', username: 'newuser' };
      const createdUser = { id: '018f6e72-23b0-7e28-9f20-b42e77b4a1a4', ...input };
      mockRepo.createUser = vi.fn().mockResolvedValue(createdUser as never);

      const result = await usersService.createUser(input);

      expect(mockRepo.createUser).toHaveBeenCalledWith(input);
      expect(result).toBe(createdUser);
    });
  });
});
