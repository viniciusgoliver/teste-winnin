import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsInt, IsOptional, MinLength } from 'class-validator';

export enum RoleUpdateGQL {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
registerEnumType(RoleUpdateGQL, { name: 'RoleUpdate' });

@InputType()
export class UpdateUserInput {
  @Field(() => Int) @IsInt() id!: number;

  @Field({ nullable: true }) @IsOptional() name?: string;

  @Field({ nullable: true }) @IsOptional() @IsEmail() email?: string;

  @Field({ nullable: true }) @IsOptional() @MinLength(6) password?: string;

  @Field(() => RoleUpdateGQL, { nullable: true })
  @IsOptional()
  role?: RoleUpdateGQL;
}
