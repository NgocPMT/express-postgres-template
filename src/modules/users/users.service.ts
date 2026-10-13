import type { User } from '../../models/user.model.js';
import { HTTP_STATUS } from '../../shared/constants/http-status.js';
import { createHttpError } from '../../shared/errors/http-error.js';
import { usersRepository, type UsersRepository, type CreateUserData } from './users.repository.js';
import type { UserDTO } from './users.schemas.js';

export class UsersService {
  constructor(private readonly repository: UsersRepository = usersRepository) {}

  mapUserDto(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : undefined,
    };
  }

  async getUserById(id: string): Promise<UserDTO> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw createHttpError(HTTP_STATUS.HTTP_404_NOT_FOUND, 'User not found');
    }
    return this.mapUserDto(user);
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.repository.findByIdentifier(identifier);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repository.existsByEmail(email);
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.repository.existsByUsername(username);
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.repository.createUser(data);
  }
}

export const usersService = new UsersService();
