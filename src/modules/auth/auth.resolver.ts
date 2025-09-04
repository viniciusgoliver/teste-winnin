/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './models/auth.output';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation(() => AuthPayload)
  signup(@Args('input') input: SignupInput) {
    return this.auth.signup(input.name, input.email, input.password);
  }

  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput) {
    return this.auth.login(input.email, input.password);
  }

  @Mutation(() => AuthPayload)
  @UseGuards(GqlAuthGuard)
  refresh(@CurrentUser() user: any) {
    return this.auth.refresh(user.sub, user.email, user.role);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: any) {
    return user.email as string;
  }
}
