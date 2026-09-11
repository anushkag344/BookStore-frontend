const http = require('http');

function request(options) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', (e) => resolve({ statusCode: 500, body: e.message }));
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing GET /get_cart_items with token header ---');
  const res1 = await request({
    host: 'localhost', port: 8080, path: '/bookstore_user/get_cart_items', method: 'GET',
    headers: { 'Content-Type': 'application/json', 'token': 'mock-token-123' }
  });
  console.log('Res 1:', res1.statusCode, res1.body);

  console.log('\n--- 2. Testing GET /get_cart_items with token query param ---');
  const res2 = await request({
    host: 'localhost', port: 8080, path: '/bookstore_user/get_cart_items?token=mock-token-123', method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  console.log('Res 2:', res2.statusCode, res2.body);

  console.log('\n--- 3. Testing GET /get_cart_items with Authorization Bearer header ---');
  const res3 = await request({
    host: 'localhost', port: 8080, path: '/bookstore_user/get_cart_items', method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token-123' }
  });
  console.log('Res 3:', res3.statusCode, res3.body);
}

run();
