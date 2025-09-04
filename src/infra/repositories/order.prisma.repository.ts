import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import {
  OrderRepository,
  PlaceOrderItem,
} from '../../core/ports/repositories/order.repository';
import { OutOfStockError } from '../../core/domain/errors/out-of-stock.error';
import { Order } from '../../core/domain/entities/order.entity';

@Injectable()
export class OrderPrismaRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async placeOrder(userId: number, items: PlaceOrderItem[]): Promise<Order> {
    if (!items?.length) throw new Error('Order items required');

    const qtyByProduct = new Map<number, number>();
    for (const it of items) {
      qtyByProduct.set(
        it.productId,
        (qtyByProduct.get(it.productId) ?? 0) + it.quantity,
      );
    }
    const normalizedItems = [...qtyByProduct.entries()].map(
      ([productId, quantity]) => ({
        productId,
        quantity,
      }),
    );

    return this.prisma.$transaction(async (tx) => {
      const productIds = normalizedItems.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      if (products.length !== productIds.length)
        throw new Error('Some products not found');

      const priceById = new Map<number, number>();
      for (const p of products) priceById.set(p.id, Number(p.price));

      for (const it of normalizedItems) {
        const res = await tx.product.updateMany({
          where: { id: it.productId, stock: { gte: it.quantity } },
          data: { stock: { decrement: it.quantity } },
        });
        if (res.count === 0) {
          throw new OutOfStockError(
            it.productId,
            'Insufficient stock for product',
          );
        }
      }

      let total = 0;
      const createItems = normalizedItems.map((it) => {
        const price = priceById.get(it.productId)!;
        total += price * it.quantity;
        return { productId: it.productId, quantity: it.quantity, price };
      });

      const order = await tx.order.create({
        data: { userId, total, items: { create: createItems } },
        include: { items: true },
      });

      return new Order(
        order.id,
        order.userId,
        Number(order.total),
        order.createdAt,
      );
    });
  }

  async findAll(): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({ include: { items: true } });
    return rows.map(
      (o) => new Order(o.id, o.userId, Number(o.total), o.createdAt),
    );
  }
}
