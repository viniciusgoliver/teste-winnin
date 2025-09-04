import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
class PlaceOrderItemInput {
  @Field(() => Int) @IsInt() productId!: number;
  @Field(() => Int) @IsInt() @Min(1) quantity!: number;
}

@InputType()
export class PlaceOrderInput {
  @Field(() => [PlaceOrderItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceOrderItemInput)
  items!: PlaceOrderItemInput[];
}
