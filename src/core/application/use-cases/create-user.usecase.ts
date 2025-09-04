import { UserRepository } from '../../ports/repositories/user.repository';
import { CreateUserDTO } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

export class CreateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: CreateUserDTO) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const role = input.role ?? 'USER';
    return this.users.create(input.name, input.email, passwordHash, role);
  }
}
