/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Args,
  Mutation,
  Query,
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CreateUserUseCase } from '../../core/application/use-cases/create-user.usecase';
import { ListUsersUseCase } from '../../core/application/use-cases/list-users.usecase';
import { CreateUserInput, RoleGQL } from './dto/create-user.input';
import { UseFilters, UseGuards } from '@nestjs/common';
import { DomainExceptionFilter } from '../../common/filters/domain-exception.filter';
import { Field, Int, ObjectType, Float } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../../infra/db/prisma.service';
import { UpdateUserInput } from './dto/update-user.input';
import { UpdateUserUseCase } from '../../core/application/use-cases/update-user.usecase';
// ✅ caminho correto do PaginationInput

import { UsersFilterInput } from './dto/users.filter.input';
import { UsersSortInput, UserSortField } from './dto/users.sort.input';
import { OrderDirection } from '../../common/dto/sort.input';
// ✅ tipagens Prisma para where/orderBy/sort
import { Prisma } from '@prisma/client';
import { PaginationInput } from 'src/core/application/dto/pagination.input';

@ObjectType('UserOrderItem')
class UserOrderItemGQL {
  @Field(() => Int) id!: number;
  @Field(() => Int) productId!: number;
  @Field(() => Int) quantity!: number;
  @Field(() => Float) price!: number;
}

@ObjectType('UserOrder')
class UserOrderGQL {
  @Field(() => Int) id!: number;
  @Field(() => Int) userId!: number;
  @Field(() => Float) total!: number;
  @Field() createdAt!: Date;
  @Field(() => [UserOrderItemGQL]) items!: UserOrderItemGQL[];
}

@ObjectType('User')
class UserGQL {
  @Field(() => Int) id!: number;
  @Field() name!: string;
  @Field() email!: string;
  @Field(() => RoleGQL) role!: RoleGQL;
  @Field() createdAt!: Date;
  @Field(() => [UserOrderGQL], { nullable: true }) orders?: UserOrderGQL[];
}

@ObjectType('UserPage')
class UserPage {
  @Field(() => [UserGQL]) items!: UserGQL[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
  @Field() hasNext!: boolean;
}

@Resolver(() => UserGQL)
@UseFilters(DomainExceptionFilter)
export class UsersResolver {
  constructor(
    private createUserUC: CreateUserUseCase,
    private listUsersUC: ListUsersUseCase,
    private prisma: PrismaService,
    private updateUserUC: UpdateUserUseCase,
  ) {}

  // Administração: criar usuário (público usa signup)
  @Mutation(() => UserGQL)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createUser(@Args('input') input: CreateUserInput) {
    return this.createUserUC.execute(input);
  }

  @Mutation(() => UserGQL)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateUser(@Args('input') input: UpdateUserInput) {
    return this.updateUserUC.execute(input as any);
  }

  @Query(() => [UserGQL])
  users() {
    return this.listUsersUC.execute();
  }

  @ResolveField(() => [UserOrderGQL], { name: 'orders' })
  async resolveOrders(@Parent() user: UserGQL): Promise<UserOrderGQL[]> {
    const rows = await this.prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { id: 'desc' },
    });
    return rows.map((o) => ({
      id: o.id,
      userId: o.userId,
      total: Number(o.total),
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        price: Number(i.price),
      })),
    }));
  }

  @Query(() => UserPage)
  async usersPage(
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
    @Args('filter', { type: () => UsersFilterInput, nullable: true }) filter?: UsersFilterInput,
    @Args('sort', { type: () => UsersSortInput, nullable: true }) sort?: UsersSortInput,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (filter?.nameContains) where.name = { contains: filter.nameContains, mode: 'insensitive' };
    if (filter?.emailEquals) where.email = filter.emailEquals;
    if (filter?.role) where.role = filter.role;
    if (filter?.createdAt) {
      const dr = filter.createdAt;
      where.createdAt = {};
      if (dr.from) where.createdAt.gte = dr.from;
      if (dr.to) where.createdAt.lte = dr.to;
      if (!Object.keys(where.createdAt).length) delete where.createdAt;
    }

    // ✅ Prisma.SortOrder e tipo explícito no orderBy
    const dir: Prisma.SortOrder =
      (sort?.direction ?? OrderDirection.DESC) === OrderDirection.ASC ? 'asc' : 'desc';

    let orderBy: Prisma.UserOrderByWithRelationInput;
    switch (sort?.field) {
      case UserSortField.NAME:
        orderBy = { name: dir };
        break;
      case UserSortField.EMAIL:
        orderBy = { email: dir };
        break;
      case UserSortField.ROLE:
        orderBy = { role: dir };
        break;
      case UserSortField.CREATED_AT:
      default:
        orderBy = { id: dir }; // proxy para createdAt desc
        break;
    }

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as any,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
      hasNext: skip + rows.length < total,
    };
  }
}