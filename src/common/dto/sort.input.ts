import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
registerEnumType(OrderDirection, { name: 'OrderDirection' });

@InputType()
export class SortInput {
  @Field(() => OrderDirection, { defaultValue: OrderDirection.DESC })
  direction: OrderDirection = OrderDirection.DESC;
}