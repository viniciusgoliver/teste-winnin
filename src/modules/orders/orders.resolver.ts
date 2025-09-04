/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PlaceOrderUseCase } from '../../core/application/use-cases/place-order.usecase';
import { PlaceOrderInput } from './dto/place-order.input';
import { UseFilters, UseGuards } from '@nestjs/common';
import { DomainExceptionFilter } from '../../common/filters/domain-exception.filter';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../../infra/db/prisma.service';
import { PaginationInput } from 'src/core/application/dto/pagination.input';

@ObjectType('OrderItem')
class OrderItemGQL {
  @Field(() => Int) id!: number;
  @Field(() => Int) productId!: number;
  @Field(() => Int) quantity!: number;
  @Field(() => Float) price!: number;
}

@ObjectType('Order')
class OrderGQL {
  @Field(() => Int) id!: number;
  @Field(() => Int) userId!: number;
  @Field(() => Float) total!: number;
  @Field() createdAt!: Date;
  @Field(() => [OrderItemGQL]) items!: OrderItemGQL[];
}

@ObjectType('OrderPage')
class OrderPage {
  @Field(() => [OrderGQL]) items!: OrderGQL[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
  @Field() hasNext!: boolean;
}

@Resolver(() => OrderGQL)
@UseFilters(DomainExceptionFilter)
@UseGuards(GqlAuthGuard, RolesGuard)
export class OrdersResolver {
  constructor(
    private placeOrderUC: PlaceOrderUseCase,
    private prisma: PrismaService,
  ) {}

  // Sem userId no input — pega do token
  @Mutation(() => OrderGQL)
  @Roles('USER', 'ADMIN')
  placeOrder(@Args('input') input: PlaceOrderInput, @CurrentUser() user: any) {
    return this.placeOrderUC.execute(user.sub, input.items);
  }

  // Todos os pedidos (ADMIN)
  @Query(() => [OrderGQL])
  @Roles('ADMIN')
  async orders() {
    const rows = await this.prisma.order.findMany({
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

  // Meus pedidos (USER/ADMIN)
  @Query(() => [OrderGQL])
  @Roles('USER', 'ADMIN')
  async myOrders(@CurrentUser() user: any) {
    const rows = await this.prisma.order.findMany({
      where: { userId: user.sub },
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

  @Query(() => OrderPage)
  @Roles('ADMIN')
  async ordersPage(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: { items: true },
      }),
      this.prisma.order.count(),
    ]);
    return {
      items: rows.map((o) => ({
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
      })),
      total,
      page,
      limit,
      hasNext: skip + rows.length < total,
    };
  }

  @Query(() => OrderPage)
  @Roles('USER', 'ADMIN')
  async myOrdersPage(
    @CurrentUser() user: any,
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId: user.sub },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: { items: true },
      }),
      this.prisma.order.count({ where: { userId: user.sub } }),
    ]);
    return {
      items: rows.map((o) => ({
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
      })),
      total,
      page,
      limit,
      hasNext: skip + rows.length < total,
    };
  }
}
