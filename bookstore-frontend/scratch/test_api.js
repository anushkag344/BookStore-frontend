const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  const email = `user_${Date.now()}@gmail.com`;
  const password = 'Password123!';

  console.log('--- 1. Registering user ---', email);
  const reg = await request({
    host: 'localhost', port: 8080, path: '/bookstore_user/registration', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { firstName: 'User', lastName: 'Test', email, password, mobileNumber: '9998887776' });
  console.log('Reg Result:', reg.statusCode, reg.body);

  console.log('\n--- 2. Attempting login ---');
  const login = await request({
    host: 'localhost', port: 8080, path: '/bookstore_user/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });
  console.log('Login Result:', login.statusCode, login.body);
}

run();
