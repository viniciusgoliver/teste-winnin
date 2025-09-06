import { ProductsResolver } from '../src/modules/products/products.resolver';
import { PrismaService } from '../src/infra/db/prisma.service';
import { CreateProductUseCase } from '../src/core/application/use-cases/create-product.usecase';
import { ListProductsUseCase } from '../src/core/application/use-cases/list-products.usecase';
import { UpdateProductUseCase } from '../src/core/application/use-cases/update-product.usecase';
import { OrderDirection } from '../src/common/dto/sort.input';
import { ProductSortField } from '../src/modules/products/dto/products.sort.input';

describe('ProductsResolver.productsPage', () => {
  let resolver: ProductsResolver;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    resolver = new ProductsResolver(
      { execute: jest.fn() } as unknown as CreateProductUseCase,
      { execute: jest.fn() } as unknown as ListProductsUseCase,
      { execute: jest.fn() } as unknown as UpdateProductUseCase,
      prisma as any,
    );
  });

  it('aplica filtros + sort por PRICE DESC e faz paginação', async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: 'A', price: 200, stock: 5, createdAt: new Date() },
      { id: 2, name: 'B', price: 150, stock: 3, createdAt: new Date() },
    ]);
    (prisma.product.count as jest.Mock).mockResolvedValue(8);

    const out = await resolver.productsPage(
      { page: 2, limit: 2 },
      { nameContains: 'a', priceMin: 100, priceMax: 300, stockMin: 1 },
      { field: ProductSortField.PRICE, direction: OrderDirection.DESC },
    );

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: 'a', mode: 'insensitive' },
          price: expect.objectContaining({ gte: 100, lte: 300 }),
          stock: expect.objectContaining({ gte: 1 }),
        }),
        orderBy: { price: 'desc' },
        skip: 2,
        take: 2,
      }),
    );

    expect(out.total).toBe(8);
    expect(out.page).toBe(2);
    expect(out.limit).toBe(2);
    expect(out.hasNext).toBe(true);
  });

  it('sort default por CREATED_AT (id desc) quando sort não enviado', async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.product.count as jest.Mock).mockResolvedValue(0);

    await resolver.productsPage(
      { page: 1, limit: 10 },
      undefined,
      undefined,
    );

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { id: 'desc' } }),
    );
  });
});