import { User } from '../../domain/entities/user.entity';

export abstract class UserRepository {
  abstract create(
    name: string,
    email: string,
    passwordHash: string,
    role: 'USER' | 'ADMIN',
  ): Promise<User>;

  abstract findAllWithOrders(): Promise<User[]>;
}
