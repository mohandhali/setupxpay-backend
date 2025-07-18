const axios = require('axios');

const BASE_URL = 'https://setupxpay-backend.onrender.com';

async function testSimpleSignup() {
  console.log('🧪 Testing SetupXPay Simple Signup...\n');

  const testData = {
    name: 'Test User Simple',
    email: `simple${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  try {
    console.log('Testing simple signup with data:', { ...testData, password: '***' });
    const signupRes = await axios.post(`${BASE_URL}/auth/signup-simple`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Simple signup successful:', signupRes.data);
  } catch (error) {
    console.log('❌ Simple signup failed:', error.response?.status, error.response?.data || error.message);
  }
}

testSimpleSignup().catch(console.error); 