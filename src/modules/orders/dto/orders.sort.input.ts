import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { OrderDirection } from '../../../common/dto/sort.input';

export enum OrderSortField {
  ID = 'ID',
  TOTAL = 'TOTAL',
  CREATED_AT = 'CREATED_AT',
}
registerEnumType(OrderSortField, { name: 'OrderSortField' });

@InputType()
export class OrdersSortInput {
  @Field(() => OrderSortField, { defaultValue: OrderSortField.CREATED_AT })
  field: OrderSortField = OrderSortField.CREATED_AT;

  @Field(() => OrderDirection, { defaultValue: OrderDirection.DESC })
  direction: OrderDirection = OrderDirection.DESC;
}