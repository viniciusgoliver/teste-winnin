import { OrderItem } from './order-item.entity';

export class Order {
  constructor(
    public readonly id: number,
    public userId: number,
    public total: number,
    public readonly createdAt: Date,
    public items: OrderItem[] = [],
  ) {}
}
