import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { UserRepository } from '../../core/ports/repositories/user.repository';
import { User } from '../../core/domain/entities/user.entity';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    name: string,
    email: string,
    passwordHash: string,
    role: 'USER' | 'ADMIN',
  ): Promise<User> {
    const u = await this.prisma.user.create({
      data: { name, email, passwordHash, role },
    });
    return new User(u.id, u.name, u.email, u.role as any, u.createdAt);
  }

  async findAllWithOrders(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: { orders: { include: { items: true } } },
    });
    return users.map(
      (u) => new User(u.id, u.name, u.email, u.role as any, u.createdAt),
    );
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      email: string;
      passwordHash: string;
      role: 'USER' | 'ADMIN';
    }>,
  ): Promise<User> {
    const u = await this.prisma.user.update({
      where: { id },
      data,
    });
    return new User(u.id, u.name, u.email, u.role as any, u.createdAt);
  }
}
