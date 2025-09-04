import {
  OrderRepository,
  PlaceOrderItem,
} from '../../ports/repositories/order.repository';

export class PlaceOrderUseCase {
  constructor(private readonly orders: OrderRepository) {}
  execute(userId: number, items: PlaceOrderItem[]) {
    return this.orders.placeOrder(userId, items);
  }
}
