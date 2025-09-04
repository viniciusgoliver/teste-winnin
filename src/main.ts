import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 GraphQL ready at http://localhost:${port}/graphql`);
}
bootstrap().catch((err) => console.error(err));
