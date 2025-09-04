import { Product } from '../../domain/entities/product.entity';

export abstract class ProductRepository {
  abstract create(name: string, price: number, stock: number): Promise<Product>;
  abstract findAll(): Promise<Product[]>;
  abstract findByIds(ids: number[]): Promise<Product[]>;

  // NEW: atualização parcial
  abstract update(
    id: number,
    data: Partial<Pick<Product, 'name' | 'price' | 'stock'>>,
  ): Promise<Product>;
}
