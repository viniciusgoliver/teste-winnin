import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DateRangeInput {
  @Field({ nullable: true }) from?: Date;
  @Field({ nullable: true }) to?: Date;
}