import { Field, ObjectType } from '@nestjs/graphql';
import { AuthUser } from './auth-user.type';

@ObjectType('AuthPayload')
export class AuthPayload {
  @Field() accessToken!: string;

  @Field({ nullable: true }) refreshToken?: string;

  @Field(() => AuthUser) user!: AuthUser;
}