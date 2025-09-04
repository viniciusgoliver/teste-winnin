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
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../../infra/db/prisma.service';

@ObjectType('UserOrderItem')
class UserOrderItemGQL {
  @Field(() => Int) id!: number;
  @Field(() => Int) productId!: number;
  @Field(() => Int) quantity!: number;
  @Field(() => Number) price!: number;
}

@ObjectType('UserOrder')
class UserOrderGQL {
  @Field(() => Int) id!: number;
  @Field(() => Int) userId!: number;
  @Field(() => Number) total!: number;
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

@Resolver(() => UserGQL)
@UseFilters(DomainExceptionFilter)
export class UsersResolver {
  constructor(
    private createUserUC: CreateUserUseCase,
    private listUsersUC: ListUsersUseCase,
    private prisma: PrismaService,
  ) {}

  @Mutation(() => UserGQL)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createUser(@Args('input') input: CreateUserInput) {
    return this.createUserUC.execute(input);
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
}
