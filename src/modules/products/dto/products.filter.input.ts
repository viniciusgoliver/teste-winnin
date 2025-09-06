import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsOptional, Min } from 'class-validator';

@InputType()
export class ProductsFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  nameContains?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  priceMin?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  priceMax?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  stockMin?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  stockMax?: number;
}