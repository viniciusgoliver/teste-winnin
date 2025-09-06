import { OrderPrismaRepository } from '../src/infra/repositories/order.prisma.repository';
import { PrismaService } from '../src/infra/db/prisma.service';
import { OutOfStockError } from '../src/core/domain/errors/out-of-stock.error';

function makeTxMock() {
  return {
    product: {
      findMany: jest.fn(),
      updateMany: jest.fn(), // ✅ necessário para o novo código
    },
    order: {
      create: jest.fn(),
    },
  };
}

describe('OrderPrismaRepository.placeOrder', () => {
  let repo: OrderPrismaRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
    } as any;

    repo = new OrderPrismaRepository(prisma as any);
  });

  it('cria pedido e decrementa estoque (sucesso)', async () => {
    const tx = makeTxMock();

    // Prisma.$transaction chama nosso callback com o tx mockado
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(tx));

    // Produtos existentes (para calcular preços)
    (tx.product.findMany as jest.Mock).mockResolvedValue([
      { id: 1, price: 100 },
      { id: 2, price: 50 },
    ]);

    // Decrementos de estoque OK (count = 1 para cada item)
    (tx.product.updateMany as jest.Mock)
      .mockResolvedValueOnce({ count: 1 }) // productId 1
      .mockResolvedValueOnce({ count: 1 }); // productId 2

    // Criação do pedido
    (tx.order.create as jest.Mock).mockResolvedValue({
      id: 99,
      userId: 7,
      total: 250, // 100*2 + 50*1
      createdAt: new Date('2025-01-01T00:00:00Z'),
      items: [],
      user: {},
    });

    const out = await repo.placeOrder(7, [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ]);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.product.findMany).toHaveBeenCalledWith({ where: { id: { in: [1, 2] } } });
    expect(tx.product.updateMany).toHaveBeenCalledTimes(2);
    expect(tx.order.create).toHaveBeenCalled();

    expect(out.id).toBe(99);
    expect(out.userId).toBe(7);
    expect(out.total).toBe(250);
  });

  it('lança OutOfStockError se algum update não afetar linhas', async () => {
    const tx = makeTxMock();

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(tx));
    (tx.product.findMany as jest.Mock).mockResolvedValue([{ id: 1, price: 10 }]);

    // Simula falta de estoque (count = 0)
    (tx.product.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    await expect(repo.placeOrder(1, [{ productId: 1, quantity: 999 }]))
      .rejects.toBeInstanceOf(OutOfStockError);

    expect(tx.product.updateMany).toHaveBeenCalledTimes(1);
  });
});