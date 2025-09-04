import { Module } from '@nestjs/common';
import { OrdersResolver } from './orders.resolver';
import { PrismaService } from '../../infra/db/prisma.service';
import { OrderPrismaRepository } from '../../infra/repositories/order.prisma.repository';
import { PlaceOrderUseCase } from '../../core/application/use-cases/place-order.usecase';

@Module({
  providers: [
    PrismaService,
    OrdersResolver,
    OrderPrismaRepository,
    { provide: 'OrderRepository', useExisting: OrderPrismaRepository },
    {
      provide: PlaceOrderUseCase,
      useFactory: (repo: any) => new PlaceOrderUseCase(repo),
      inject: ['OrderRepository'],
    },
  ],
})
export class OrdersModule {}
