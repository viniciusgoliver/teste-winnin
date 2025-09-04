/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { UserRepository } from '../../ports/repositories/user.repository';
import * as bcrypt from 'bcrypt';

export class UpdateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: {
    id: number;
    name?: string;
    email?: string;
    password?: string;
    role?: 'USER' | 'ADMIN';
  }) {
    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email;
    if (input.role !== undefined) data.role = input.role;

    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, 10);
    }

    return this.users.update(input.id, data);
  }
}
