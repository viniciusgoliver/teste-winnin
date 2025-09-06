/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload, AuthUser } from './models/auth.output';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { PrismaService } from '../../infra/db/prisma.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

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

  // (opcional) retorna o usuário autenticado
  @Query(() => AuthUser)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: any) {
    const u = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return { ...u, role: u?.role as any } as AuthUser;
  }
}