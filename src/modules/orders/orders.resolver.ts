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

@Resolver(() => OrderGQL)
@UseFilters(DomainExceptionFilter)
@UseGuards(GqlAuthGuard, RolesGuard)
export class OrdersResolver {
  constructor(
    private placeOrderUC: PlaceOrderUseCase,
    private prisma: PrismaService,
  ) {}

  @Mutation(() => OrderGQL)
  @Roles('USER', 'ADMIN')
  placeOrder(@Args('input') input: PlaceOrderInput, @CurrentUser() user: any) {
    return this.placeOrderUC.execute(user.sub, input.items);
  }

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
}
