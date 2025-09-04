export class Product {
  constructor(
    public readonly id: number,
    public name: string,
    public price: number,
    public stock: number,
    public readonly createdAt: Date,
  ) {
    if (this.stock < 0) throw new Error('Stock cannot be negative');
  }
}
