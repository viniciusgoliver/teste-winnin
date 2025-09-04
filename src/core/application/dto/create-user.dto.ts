export class CreateUserDTO {
  name!: string;
  email!: string;
  password!: string;
  role?: 'USER' | 'ADMIN';
}
