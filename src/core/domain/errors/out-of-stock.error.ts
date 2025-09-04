export class OutOfStockError extends Error {
  constructor(
    public productId: number,
    message = 'Not enough stock',
  ) {
    super(message);
  }
}
