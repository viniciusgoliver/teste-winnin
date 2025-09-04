import { User } from '../../domain/entities/user.entity';

export abstract class UserRepository {
  abstract create(
    name: string,
    email: string,
    passwordHash: string,
    role: 'USER' | 'ADMIN',
  ): Promise<User>;

  abstract findAllWithOrders(): Promise<User[]>;

  // NEW: atualização parcial (hash será tratado no use case)
  abstract update(
    id: number,
    data: Partial<{
      name: string;
      email: string;
      passwordHash: string;
      role: 'USER' | 'ADMIN';
    }>,
  ): Promise<User>;
}
