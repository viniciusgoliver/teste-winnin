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

@ObjectType('Product')
class ProductGQL {
  @Field(() => Int) id!: number;
  @Field() name!: string;
  @Field(() => Float) price!: number;
  @Field(() => Int) stock!: number;
  @Field() createdAt!: Date;
}

@Resolver(() => ProductGQL)
@UseFilters(DomainExceptionFilter)
export class ProductsResolver {
  constructor(
    private createProductUC: CreateProductUseCase,
    private listProductsUC: ListProductsUseCase,
  ) {}

  @Mutation(() => ProductGQL)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createProduct(@Args('input') input: CreateProductInput) {
    return this.createProductUC.execute(input);
  }

  @Query(() => [ProductGQL])
  products() {
    return this.listProductsUC.execute();
  }
}
