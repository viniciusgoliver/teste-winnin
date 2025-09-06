import { OrdersResolver } from '../src/modules/orders/orders.resolver';
import { PrismaService } from '../src/infra/db/prisma.service';
import { PlaceOrderUseCase } from '../src/core/application/use-cases/place-order.usecase';
import { OrderDirection } from '../src/common/dto/sort.input';
import { OrderSortField } from '../src/modules/orders/dto/orders.sort.input';

describe('OrdersResolver', () => {
  let resolver: OrdersResolver;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      order: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    resolver = new OrdersResolver(
      { execute: jest.fn().mockResolvedValue({ id: 1, userId: 10, total: 100, createdAt: new Date(), items: [] }) } as unknown as PlaceOrderUseCase,
      prisma as any,
    );
  });

  it('ordersPage (ADMIN): aplica filtros e sort por TOTAL DESC', async () => {
    (prisma.order.findMany as jest.Mock).mockResolvedValue([
      { id: 1, userId: 99, total: 130, createdAt: new Date(), items: [] },
    ]);
    (prisma.order.count as jest.Mock).mockResolvedValue(5);

    const out = await resolver.ordersPage(
      { page: 2, limit: 2 },
      { userId: 99, totalMin: 100 },
      { field: OrderSortField.TOTAL, direction: OrderDirection.DESC },
    );

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 99,
          total: expect.objectContaining({ gte: 100 }),
        }),
        orderBy: { total: 'desc' },
        skip: 2,
        take: 2,
        include: { items: true },
      }),
    );

    expect(out.total).toBe(5);
    expect(out.items[0].userId).toBe(99);
  });

  it('myOrdersPage (USER): filtra por userId do token', async () => {
    (prisma.order.findMany as jest.Mock).mockResolvedValue([
      { id: 2, userId: 11, total: 50, createdAt: new Date(), items: [] },
    ]);
    (prisma.order.count as jest.Mock).mockResolvedValue(1);

    const out = await resolver.myOrdersPage(
      { sub: 11 } as any,
      { page: 1, limit: 10 },
      { totalMin: 10 },
      { field: OrderSortField.CREATED_AT, direction: OrderDirection.DESC },
    );

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 11,
          total: expect.objectContaining({ gte: 10 }),
        }),
        orderBy: { id: 'desc' }, // CREATED_AT -> id desc
        skip: 0,
        take: 10,
      }),
    );

    expect(out.total).toBe(1);
    expect(out.items[0].userId).toBe(11);
  });
});