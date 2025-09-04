import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field() @IsNotEmpty() name!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price!: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  stock!: number;
}
