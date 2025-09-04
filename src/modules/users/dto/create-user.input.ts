import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export enum RoleGQL {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
registerEnumType(RoleGQL, { name: 'Role' });

@InputType()
export class CreateUserInput {
  @Field() @IsNotEmpty() name!: string;

  @Field() @IsEmail() email!: string;

  @Field() @MinLength(6) password!: string;

  @Field(() => RoleGQL, { nullable: true })
  @IsOptional()
  role?: RoleGQL; // default USER no use case
}
