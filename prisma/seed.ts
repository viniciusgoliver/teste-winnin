const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [docker] seed: iniciando verificação...');

  const [usersCount, productsCount, ordersCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  if (usersCount === 0) {
    console.log('👤 Criando usuários padrão...');
    await prisma.user.createMany({
      data: [
        {
          name: 'Admin Master',
          email: 'admin@teste.com',
          passwordHash: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
        },
        {
          name: 'User Comum',
          email: 'user@teste.com',
          passwordHash: await bcrypt.hash('user123', 10),
          role: 'USER',
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Users criados');
  } else {
    console.log(`👤 Users já existem (${usersCount}) — pulando criação`);
  }

  if (productsCount === 0) {
    console.log('🛒 Criando 20 produtos...');
    const batch: { name: string; price: number; stock: number }[] = [];
    for (let i = 1; i <= 20; i++) {
      batch.push({
        name: `Produto Seed ${i}`,
        price: Math.floor(Math.random() * 500) + 50,
        stock: Math.floor(Math.random() * 20) + 5,
      });
    }
    await prisma.product.createMany({ data: batch, skipDuplicates: true });
    console.log('✅ 20 produtos criados');
  } else {
    console.log(`🛒 Produtos já existem (${productsCount}) — pulando criação`);
  }

  if (ordersCount === 0) {
    console.log('📦 Criando 10 pedidos de teste...');
    const [admin, user] = await Promise.all([
      prisma.user.findUnique({ where: { email: 'admin@teste.com' } }),
      prisma.user.findUnique({ where: { email: 'user@teste.com' } }),
    ]);

    const products = await prisma.product.findMany({ take: 5 });

    for (let i = 1; i <= 10; i++) {
      const owner = i % 2 === 0 ? admin : user;
      const itemsData = products.map((p) => ({
        productId: p.id,
        quantity: Math.floor(Math.random() * 2) + 1,
        price: p.price,
      }));
      const total = itemsData.reduce((acc, it) => acc + Number(it.price) * it.quantity, 0);

      await prisma.order.create({
        data: {
          userId: owner.id,
          total,
          items: { create: itemsData },
        },
      });
    }
    console.log('✅ 10 pedidos criados');
  } else {
    console.log(`📦 Pedidos já existem (${ordersCount}) — pulando criação`);
  }

  console.log('🌱 [docker] seed: finalizado!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });