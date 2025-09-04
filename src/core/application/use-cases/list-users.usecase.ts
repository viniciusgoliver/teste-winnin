import { UserRepository } from '../../ports/repositories/user.repository';

export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}
  execute() {
    return this.users.findAllWithOrders();
  }
}
