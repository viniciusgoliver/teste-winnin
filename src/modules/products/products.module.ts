/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Module } from '@nestjs/common';
import { ProductsResolver } from './products.resolver';
import { PrismaService } from '../../infra/db/prisma.service';
import { ProductPrismaRepository } from '../../infra/repositories/product.prisma.repository';
import { CreateProductUseCase } from '../../core/application/use-cases/create-product.usecase';
import { ListProductsUseCase } from '../../core/application/use-cases/list-products.usecase';

@Module({
  providers: [
    PrismaService,
    ProductsResolver,
    ProductPrismaRepository,
    { provide: 'ProductRepository', useExisting: ProductPrismaRepository },
    {
      provide: CreateProductUseCase,
      useFactory: (repo: any) => new CreateProductUseCase(repo),
      inject: ['ProductRepository'],
    },
    {
      provide: ListProductsUseCase,
      useFactory: (repo: any) => new ListProductsUseCase(repo),
      inject: ['ProductRepository'],
    },
  ],
})
export class ProductsModule {}
