/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ProductRepository } from '../../ports/repositories/product.repository';

export class UpdateProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(input: {
    id: number;
    name?: string;
    price?: number;
    stock?: number;
  }) {
    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.price !== undefined) data.price = input.price;
    if (input.stock !== undefined) data.stock = input.stock;

    return this.products.update(input.id, data);
  }
}
