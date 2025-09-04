export class OrderItem {
  constructor(
    public readonly id: number,
    public productId: number,
    public quantity: number,
    public price: number,
  ) {
    if (quantity <= 0) throw new Error('Quantity must be > 0');
  }
}
