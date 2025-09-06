import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { OrderDirection } from '../../../common/dto/sort.input';

export enum ProductSortField {
  NAME = 'NAME',
  PRICE = 'PRICE',
  STOCK = 'STOCK',
  CREATED_AT = 'CREATED_AT',
}
registerEnumType(ProductSortField, { name: 'ProductSortField' });

@InputType()
export class ProductsSortInput {
  @Field(() => ProductSortField, { defaultValue: ProductSortField.CREATED_AT })
  field: ProductSortField = ProductSortField.CREATED_AT;

  @Field(() => OrderDirection, { defaultValue: OrderDirection.DESC })
  direction: OrderDirection = OrderDirection.DESC;
}