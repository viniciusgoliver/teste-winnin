import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { gql as gqlReq } from '../utils/gql-client';

// Mutations e Queries usadas no fluxo
const MUT_LOGIN = `
  mutation Login($email:String!, $password:String!) {
    login(input: { email: $email, password: $password }) {
      accessToken
      refreshToken
      user { id name email role createdAt }
    }
  }
`;

const MUT_CREATE_PRODUCT = `
  mutation CreateProduct($name:String!, $price:Float!, $stock:Int!) {
    createProduct(input:{ name:$name, price:$price, stock:$stock }) {
      id name price stock createdAt
    }
  }
`;

const QRY_PRODUCTS_PAGE = `
  query ProductsPage($page:Int!, $limit:Int!) {
    productsPage(
      pagination: { page:$page, limit:$limit }
      sort: { field: PRICE, direction: DESC }
    ) {
      total page limit hasNext
      items { id name price stock }
    }
  }
`;

const MUT_PLACE_ORDER = `
  mutation PlaceOrder($items:[PlaceOrderItemInput!]!) {
    placeOrder(input: { items: $items }) {
      id userId total createdAt
      items { id productId quantity price }
    }
  }
`;

const QRY_MY_ORDERS_PAGE = `
  query MyOrdersPage($page:Int!, $limit:Int!) {
    myOrdersPage(
      pagination: { page:$page, limit:$limit }
      sort: { field: CREATED_AT, direction: DESC }
    ) {
      total page limit hasNext
      items { id total createdAt items { productId quantity price } }
    }
  }
`;

describe('E2E /graphql fluxo admin->produtos e user->pedidos', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    // pipes/filters como no main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Admin cria produto e lista página; User compra e lista seus pedidos', async () => {
    // 1) LOGIN ADMIN (seed: admin@teste.com / admin123)
    const adminLogin = await gqlReq(app, MUT_LOGIN, {
      email: 'admin@teste.com',
      password: 'admin123',
    });
    expect(adminLogin.login.accessToken).toBeDefined();
    const adminToken = adminLogin.login.accessToken;

    // 2) ADMIN CRIA PRODUTO
    const productName = `Teclado-${Date.now()}`;
    const createRes = await gqlReq(
      app,
      MUT_CREATE_PRODUCT,
      { name: productName, price: 199.9, stock: 5 },
      adminToken,
    );
    expect(createRes.createProduct.id).toBeDefined();
    expect(createRes.createProduct.name).toBe(productName);
    const productId = createRes.createProduct.id;

    // 3) ADMIN CONSULTA PRODUCTS PAGE
    const pageRes = await gqlReq(
      app,
      QRY_PRODUCTS_PAGE,
      { page: 1, limit: 5 },
      adminToken,
    );
    expect(pageRes.productsPage.items.length).toBeGreaterThan(0);
    const found = pageRes.productsPage.items.find((p: any) => p.id === productId);
    expect(found).toBeTruthy();

    // 4) LOGIN USER (seed: user@teste.com / user123)
    const userLogin = await gqlReq(app, MUT_LOGIN, {
      email: 'user@teste.com',
      password: 'user123',
    });
    expect(userLogin.login.accessToken).toBeDefined();
    const userToken = userLogin.login.accessToken;

    // 5) USER FAZ PEDIDO DE 2 UNIDADES DO PRODUTO CRIADO
    const orderRes = await gqlReq(
      app,
      MUT_PLACE_ORDER,
      { items: [{ productId, quantity: 2 }] },
      userToken,
    );
    expect(orderRes.placeOrder.id).toBeDefined();
    expect(orderRes.placeOrder.items[0].productId).toBe(productId);
    expect(orderRes.placeOrder.items[0].quantity).toBe(2);

    // 6) USER LISTA SEUS PEDIDOS (PAGINADO)
    const myPage = await gqlReq(
      app,
      QRY_MY_ORDERS_PAGE,
      { page: 1, limit: 5 },
      userToken,
    );
    expect(myPage.myOrdersPage.total).toBeGreaterThan(0);
    const myOrder = myPage.myOrdersPage.items.find((o: any) =>
      o.items.some((i: any) => i.productId === productId),
    );
    expect(myOrder).toBeTruthy();
  });
});