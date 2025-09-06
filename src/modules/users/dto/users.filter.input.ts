import { Field, InputType } from '@nestjs/graphql';
import { RoleGQL } from './create-user.input';
import { IsEmail, IsOptional } from 'class-validator';
import { DateRangeInput } from '../../../common/dto/date-range.input';

@InputType()
export class UsersFilterInput {
  @Field({ nullable: true }) @IsOptional() nameContains?: string;
  @Field({ nullable: true }) @IsOptional() @IsEmail() emailEquals?: string;
  @Field(() => RoleGQL, { nullable: true }) @IsOptional() role?: RoleGQL;
  @Field(() => DateRangeInput, { nullable: true }) createdAt?: DateRangeInput;
}