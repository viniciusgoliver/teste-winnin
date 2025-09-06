import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min } from 'class-validator';
import { DateRangeInput } from '../../../common/dto/date-range.input';

@InputType()
export class OrdersFilterInput {
  @Field(() => Int, { nullable: true })
  @IsOptional() @IsInt() userId?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional() @Min(0) totalMin?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional() @Min(0) totalMax?: number;

  @Field(() => DateRangeInput, { nullable: true })
  @IsOptional() createdAt?: DateRangeInput;
}