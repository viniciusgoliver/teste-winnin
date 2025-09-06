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
// ✅ caminho correto


import { OrdersFilterInput } from './dto/orders.filter.input';
import { OrdersSortInput, OrderSortField } from './dto/orders.sort.input';
import { OrderDirection } from '../../common/dto/sort.input';
// ✅ tipagens Prisma
import { Prisma } from '@prisma/client';
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
  async placeOrder(@Args('input') input: PlaceOrderInput, @CurrentUser() user: any) {
    const created = await this.placeOrderUC.execute(user.sub, input.items);

    // Busca o pedido completo com items
    const row = await this.prisma.order.findUnique({
      where: { id: created.id },
      include: { items: true },
    });

    // Mapeia para o tipo GQL esperado
    return {
      id: row!.id,
      userId: row!.userId,
      total: Number(row!.total),
      createdAt: row!.createdAt,
      items: row!.items.map(i => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        price: Number(i.price),
      })),
    };
  }

  // Todos os pedidos (ADMIN)
  @Query(() => [OrderGQL])
  @Roles('ADMIN')
  async orders() {
    const rows = (await this.prisma.order.findMany({
      include: { items: true },
      orderBy: { id: 'desc' },
    })) as Array<Prisma.OrderGetPayload<{ include: { items: true } }>>;

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
    const rows = (await this.prisma.order.findMany({
      where: { userId: user.sub },
      include: { items: true },
      orderBy: { id: 'desc' },
    })) as Array<Prisma.OrderGetPayload<{ include: { items: true } }>>;

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
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
    @Args('filter', { type: () => OrdersFilterInput, nullable: true }) filter?: OrdersFilterInput,
    @Args('sort', { type: () => OrdersSortInput, nullable: true }) sort?: OrdersSortInput,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (filter?.userId) where.userId = filter.userId;
    if (filter?.totalMin !== undefined || filter?.totalMax !== undefined) {
      where.total = {};
      if (filter.totalMin !== undefined) where.total.gte = filter.totalMin;
      if (filter.totalMax !== undefined) where.total.lte = filter.totalMax;
    }
    if (filter?.createdAt) {
      const dr = filter.createdAt;
      where.createdAt = {};
      if (dr.from) where.createdAt.gte = dr.from;
      if (dr.to) where.createdAt.lte = dr.to;
      if (!Object.keys(where.createdAt).length) delete where.createdAt;
    }

    const dir: Prisma.SortOrder =
      (sort?.direction ?? OrderDirection.DESC) === OrderDirection.ASC ? 'asc' : 'desc';

    let orderBy: Prisma.OrderOrderByWithRelationInput;
    switch (sort?.field) {
      case OrderSortField.TOTAL:
        orderBy = { total: dir };
        break;
      case OrderSortField.ID:
        orderBy = { id: dir };
        break;
      case OrderSortField.CREATED_AT:
      default:
        // se createdAt existir como campo ordenável no schema, use { createdAt: dir }
        // como proxy padrão, usamos id
        orderBy = { id: dir };
        break;
    }

    const rows = (await this.prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { items: true },
    })) as Array<Prisma.OrderGetPayload<{ include: { items: true } }>>;
    const total = await this.prisma.order.count({ where });

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
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
    @Args('filter', { type: () => OrdersFilterInput, nullable: true }) filter?: OrdersFilterInput,
    @Args('sort', { type: () => OrdersSortInput, nullable: true }) sort?: OrdersSortInput,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { userId: user.sub };
    if (filter?.totalMin !== undefined || filter?.totalMax !== undefined) {
      where.total = {};
      if (filter.totalMin !== undefined) where.total.gte = filter.totalMin;
      if (filter.totalMax !== undefined) where.total.lte = filter.totalMax;
    }
    if (filter?.createdAt) {
      const dr = filter.createdAt;
      where.createdAt = {};
      if (dr.from) where.createdAt.gte = dr.from;
      if (dr.to) where.createdAt.lte = dr.to;
      if (!Object.keys(where.createdAt).length) delete where.createdAt;
    }

    const dir: Prisma.SortOrder =
      (sort?.direction ?? OrderDirection.DESC) === OrderDirection.ASC ? 'asc' : 'desc';

    let orderBy: Prisma.OrderOrderByWithRelationInput;
    switch (sort?.field) {
      case OrderSortField.TOTAL:
        orderBy = { total: dir };
        break;
      case OrderSortField.ID:
        orderBy = { id: dir };
        break;
      case OrderSortField.CREATED_AT:
      default:
        orderBy = { id: dir };
        break;
    }

    const rows = (await this.prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { items: true },
    })) as Array<Prisma.OrderGetPayload<{ include: { items: true } }>>;
    const total = await this.prisma.order.count({ where });

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