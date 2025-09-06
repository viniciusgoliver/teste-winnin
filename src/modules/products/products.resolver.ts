import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProductUseCase } from '../../core/application/use-cases/create-product.usecase';
import { ListProductsUseCase } from '../../core/application/use-cases/list-products.usecase';
import { CreateProductInput } from './dto/create-product.input';
import { UseFilters, UseGuards } from '@nestjs/common';
import { DomainExceptionFilter } from '../../common/filters/domain-exception.filter';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateProductInput } from './dto/update-product.input';
import { UpdateProductUseCase } from '../../core/application/use-cases/update-product.usecase';

import { PrismaService } from '../../infra/db/prisma.service';
// ✅ ajuste do caminho do PaginationInput


import { ProductsFilterInput } from './dto/products.filter.input';
import { ProductsSortInput, ProductSortField } from './dto/products.sort.input';
import { OrderDirection } from '../../common/dto/sort.input';
// ✅ import do tipo do Prisma para tipar orderBy/sort
import { Prisma } from '@prisma/client';
import { PaginationInput } from 'src/core/application/dto/pagination.input';

@ObjectType('Product')
class ProductGQL {
  @Field(() => Int) id!: number;
  @Field() name!: string;
  @Field(() => Float) price!: number;
  @Field(() => Int) stock!: number;
  @Field() createdAt!: Date;
}

@ObjectType('ProductPage')
class ProductPage {
  @Field(() => [ProductGQL]) items!: ProductGQL[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
  @Field() hasNext!: boolean;
}

@Resolver(() => ProductGQL)
@UseFilters(DomainExceptionFilter)
export class ProductsResolver {
  constructor(
    private createProductUC: CreateProductUseCase,
    private listProductsUC: ListProductsUseCase,
    private updateProductUC: UpdateProductUseCase,
    private prisma: PrismaService,
  ) {}

  @Mutation(() => ProductGQL)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createProduct(@Args('input') input: CreateProductInput) {
    return this.createProductUC.execute(input);
  }

  @Mutation(() => ProductGQL)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateProduct(@Args('input') input: UpdateProductInput) {
    return this.updateProductUC.execute(input);
  }

  @Query(() => [ProductGQL])
  products() {
    return this.listProductsUC.execute();
  }

  @Query(() => ProductPage)
  async productsPage(
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
    @Args('filter', { type: () => ProductsFilterInput, nullable: true }) filter?: ProductsFilterInput,
    @Args('sort', { type: () => ProductsSortInput, nullable: true }) sort?: ProductsSortInput,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (filter?.nameContains) {
      where.name = { contains: filter.nameContains, mode: 'insensitive' };
    }
    if (filter?.priceMin !== undefined || filter?.priceMax !== undefined) {
      where.price = {};
      if (filter.priceMin !== undefined) where.price.gte = filter.priceMin;
      if (filter.priceMax !== undefined) where.price.lte = filter.priceMax;
    }
    if (filter?.stockMin !== undefined || filter?.stockMax !== undefined) {
      where.stock = {};
      if (filter.stockMin !== undefined) where.stock.gte = filter.stockMin;
      if (filter.stockMax !== undefined) where.stock.lte = filter.stockMax;
    }

    // ✅ tipagem explícita evita o union de objetos com string
    const dir: Prisma.SortOrder =
      (sort?.direction ?? OrderDirection.DESC) === OrderDirection.ASC ? 'asc' : 'desc';

    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort?.field) {
      case ProductSortField.NAME:
        orderBy = { name: dir };
        break;
      case ProductSortField.PRICE:
        orderBy = { price: dir };
        break;
      case ProductSortField.STOCK:
        orderBy = { stock: dir };
        break;
      case ProductSortField.CREATED_AT:
      default:
        // se não tiver createdAt no schema, usamos id como proxy de createdAt
        orderBy = { id: dir };
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        stock: p.stock,
        createdAt: p.createdAt,
      })),
      total,
      page,
      limit,
      hasNext: skip + items.length < total,
    };
  }
}