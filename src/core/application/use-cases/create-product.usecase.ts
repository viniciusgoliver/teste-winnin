import { ProductRepository } from '../../ports/repositories/product.repository';
import { CreateProductDTO } from '../dto/create-product.dto';

export class CreateProductUseCase {
  constructor(private readonly products: ProductRepository) {}
  execute(input: CreateProductDTO) {
    return this.products.create(input.name, input.price, input.stock);
  }
}
