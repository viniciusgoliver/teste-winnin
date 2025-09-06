import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/infra/db/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    jwt = {
      signAsync: jest.fn().mockResolvedValue('jwt-token'),
      sign: jest.fn().mockReturnValue('jwt-token'),
    } as any;

    service = new AuthService(prisma as any, jwt as any);
  });

  it('signup: cria user e retorna tokens + user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Alice',
      email: 'alice@x.com',
      role: 'USER',
      createdAt: new Date('2025-01-01T00:00:00Z'),
    });

    const out = await service.signup('Alice', 'alice@x.com', 'secret');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'alice@x.com' } });
    expect(prisma.user.create).toHaveBeenCalled();
    expect(out.accessToken).toBe('jwt-token');
    expect(out.refreshToken).toBe('jwt-token');
    expect(out.user).toMatchObject({ id: 1, email: 'alice@x.com', role: 'USER' });
  });

  it('login: ok com credenciais válidas', async () => {
    const hash = await bcrypt.hash('secret', 1);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2, name: 'Bob', email: 'bob@x.com', role: 'ADMIN', passwordHash: hash, createdAt: new Date(),
    });

    const out = await service.login('bob@x.com', 'secret');
    expect(out.accessToken).toBe('jwt-token');
    expect(out.user).toMatchObject({ id: 2, email: 'bob@x.com', role: 'ADMIN' });
  });

  it('login: lança Unauthorized em email inexistente', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.login('no@x.com', 'x')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login: lança Unauthorized em senha inválida', async () => {
    const hash = await bcrypt.hash('right', 1);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 3, name: 'C', email: 'c@x.com', role: 'USER', passwordHash: hash, createdAt: new Date(),
    });
    await expect(service.login('c@x.com', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh: retorna tokens + user do banco', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 10, name: 'Z', email: 'z@x.com', role: 'USER', createdAt: new Date(),
    });
    const out = await service.refresh(10, 'x', 'USER');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 10 }, select: expect.any(Object) });
    expect(out.user.id).toBe(10);
  });
});