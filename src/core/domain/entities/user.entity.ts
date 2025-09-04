export class User {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public role: 'USER' | 'ADMIN',
    public readonly createdAt: Date,
  ) {}
}
