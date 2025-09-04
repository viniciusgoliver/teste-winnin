/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// npm i node-fetch@2
import fetch from 'node-fetch';
const URL = 'http://localhost:3000/graphql';
const q = `mutation($u:Int!,$p:Int!,$q:Int!){placeOrder(input:{userId:$u,items:[{productId:$p,quantity:$q}]}){id total}}`;

async function tryOrder() {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: q, variables: { u: 1, p: 1, q: 1 } }),
  });
  const j = await res.json();
  return j.errors ? 'ERR' : 'OK';
}

await (async () => {
  const results = await Promise.all([...Array(10)].map(() => tryOrder()));
  console.log(results);
})();
