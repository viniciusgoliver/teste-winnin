import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../infra/db/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(name: string, email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new UnauthorizedException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { name, email, passwordHash, role: 'USER' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return this.issueTokensWithUser(user);
  }

  async login(email: string, password: string) {
    const found = await this.prisma.user.findUnique({ where: { email } });
    if (!found) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, found.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // seleciona somente os campos expostos no GraphQL
    const user = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      createdAt: found.createdAt,
    };

    return this.issueTokensWithUser(user);
  }

  async refresh(userId: number, _email: string, _role: string) {
    // Busca user atualizado para refletir alterações de role/nome/etc
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    return this.issueTokensWithUser(user);
  }

  private async issueTokensWithUser(user: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES || '15m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        createdAt: user.createdAt,
      },
    };
  }
}