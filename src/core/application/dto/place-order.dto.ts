export type PlaceOrderDTO = {
  userId: number;
  items: { productId: number; quantity: number }[];
};
