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

  // lista simples (já existente)
  @Query(() => [ProductGQL])
  products() {
    return this.listProductsUC.execute();
  }

  // paginação simples
  @Query(() => ProductPage)
  async productsPage(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.product.count(),
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
