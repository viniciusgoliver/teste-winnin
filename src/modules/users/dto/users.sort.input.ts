import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { OrderDirection } from '../../../common/dto/sort.input';

export enum UserSortField {
  NAME = 'NAME',
  EMAIL = 'EMAIL',
  ROLE = 'ROLE',
  CREATED_AT = 'CREATED_AT',
}
registerEnumType(UserSortField, { name: 'UserSortField' });

@InputType()
export class UsersSortInput {
  @Field(() => UserSortField, { defaultValue: UserSortField.CREATED_AT })
  field: UserSortField = UserSortField.CREATED_AT;

  @Field(() => OrderDirection, { defaultValue: OrderDirection.DESC })
  direction: OrderDirection = OrderDirection.DESC;
}