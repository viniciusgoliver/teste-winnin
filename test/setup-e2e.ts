jest.setTimeout(30000);

// Ajuste aqui se quiser isolar variáveis de teste:
process.env.JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
process.env.JWT_EXPIRES = process.env.JWT_EXPIRES || '15m';
process.env.JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

// Se quiser apontar para um DB de teste separado, defina DATABASE_URL antes de rodar.
// Ex.: export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/winnin_test?schema=public'