/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { PrismaService } from '../../infra/db/prisma.service';
import { UserPrismaRepository } from '../../infra/repositories/user.prisma.repository';
import { CreateUserUseCase } from '../../core/application/use-cases/create-user.usecase';
import { ListUsersUseCase } from '../../core/application/use-cases/list-users.usecase';

@Module({
  providers: [
    PrismaService,
    UsersResolver,
    UserPrismaRepository,
    { provide: 'UserRepository', useExisting: UserPrismaRepository },
    {
      provide: CreateUserUseCase,
      useFactory: (repo: any) => new CreateUserUseCase(repo),
      inject: ['UserRepository'],
    },
    {
      provide: ListUsersUseCase,
      useFactory: (repo: any) => new ListUsersUseCase(repo),
      inject: ['UserRepository'],
    },
  ],
})
export class UsersModule {}
