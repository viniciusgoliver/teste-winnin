import { execSync } from 'child_process';

async function main() {
  console.log('🧹 Limpando banco de dados...');
  execSync('npx prisma migrate reset --force --skip-generate --skip-seed', {
    stdio: 'inherit',
  });

  console.log('🗃️ Rodando migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('🌱 Executando seed...');
  execSync('npm run prisma:seed', { stdio: 'inherit' });

  console.log('✅ Banco resetado e populado com sucesso!');
}

main().catch((err) => {
  console.error('❌ Erro ao resetar o banco:', err);
  process.exit(1);
});