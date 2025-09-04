import { Order } from '../../domain/entities/order.entity';
export type PlaceOrderItem = { productId: number; quantity: number };

export abstract class OrderRepository {
  abstract placeOrder(userId: number, items: PlaceOrderItem[]): Promise<Order>;
  abstract findAll(): Promise<Order[]>;
}
