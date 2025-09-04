import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { ProductRepository } from '../../core/ports/repositories/product.repository';
import { Product } from '../../core/domain/entities/product.entity';

@Injectable()
export class ProductPrismaRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, price: number, stock: number): Promise<Product> {
    const p = await this.prisma.product.create({
      data: { name, price, stock },
    });
    return new Product(p.id, p.name, Number(p.price), p.stock, p.createdAt);
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany();
    return rows.map(
      (p) => new Product(p.id, p.name, Number(p.price), p.stock, p.createdAt),
    );
  }

  async findByIds(ids: number[]): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });
    return rows.map(
      (p) => new Product(p.id, p.name, Number(p.price), p.stock, p.createdAt),
    );
  }
}
