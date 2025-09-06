import request = require('supertest');
import { INestApplication } from '@nestjs/common';

export async function gql(
  app: INestApplication,
  query: string,
  variables?: Record<string, any>,
  token?: string,
) {
  const httpServer = app.getHttpServer();

  const req = request(httpServer)
    .post('/graphql')
    .send({ query, variables });

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  const res = await req.expect(200);
  if (res.body.errors) {
    const messages = res.body.errors.map((e: any) => e.message).join(' | ');
    throw new Error(`GraphQL errors: ${messages}`);
  }
  return res.body.data;
}