import { ProductRepository } from '../../ports/repositories/product.repository';

export class ListProductsUseCase {
  constructor(private readonly products: ProductRepository) {}
  execute() {
    return this.products.findAll();
  }
}
