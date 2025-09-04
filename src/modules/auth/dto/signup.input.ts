import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class SignupInput {
  @Field() @IsNotEmpty() name!: string;
  @Field() @IsEmail() email!: string;
  @Field() @MinLength(6) password!: string;
}
