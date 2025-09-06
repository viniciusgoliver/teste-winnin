import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RoleGQL } from '../../users/dto/create-user.input';

@ObjectType('AuthUser')
export class AuthUser {
  @Field(() => Int) id!: number;
  @Field() name!: string;
  @Field() email!: string;
  @Field(() => RoleGQL) role!: RoleGQL;
  @Field() createdAt!: Date;
}