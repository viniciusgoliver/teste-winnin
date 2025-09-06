import { UsersResolver } from '../src/modules/users/users.resolver';
import { PrismaService } from '../src/infra/db/prisma.service';
import { CreateUserUseCase } from '../src/core/application/use-cases/create-user.usecase';
import { ListUsersUseCase } from '../src/core/application/use-cases/list-users.usecase';
import { UpdateUserUseCase } from '../src/core/application/use-cases/update-user.usecase';
import { OrderDirection } from '../src/common/dto/sort.input';
import { UserSortField } from '../src/modules/users/dto/users.sort.input';
import { RoleGQL } from '../src/modules/users/dto/create-user.input';

describe('UsersResolver.usersPage', () => {
  let resolver: UsersResolver;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
      },
    } as any;

    resolver = new UsersResolver(
      { execute: jest.fn() } as unknown as CreateUserUseCase,
      { execute: jest.fn() } as unknown as ListUsersUseCase,
      prisma as any,
      { execute: jest.fn() } as unknown as UpdateUserUseCase,
    );
  });

  it('aplica filtros + sort por NAME ASC e pagina', async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Alice', email: 'a@x.com', role: RoleGQL.USER, createdAt: new Date() },
      { id: 2, name: 'Bob',   email: 'b@x.com', role: RoleGQL.ADMIN, createdAt: new Date() },
    ]);
    (prisma.user.count as jest.Mock).mockResolvedValue(3);

    const out = await resolver.usersPage(
      { page: 1, limit: 2 },
      { role: RoleGQL.USER, nameContains: 'a' },
      { field: UserSortField.NAME, direction: OrderDirection.ASC },
    );

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: RoleGQL.USER,
          name: { contains: 'a', mode: 'insensitive' },
        }),
        orderBy: { name: 'asc' },
        skip: 0,
        take: 2,
      }),
    );

    expect(out.total).toBe(3);
    expect(out.hasNext).toBe(true);
  });

  it('sem sort => default id desc (createdAt desc)', async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.user.count as jest.Mock).mockResolvedValue(0);

    await resolver.usersPage({ page: 1, limit: 10 }, undefined, undefined);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { id: 'desc' } }),
    );
  });
});