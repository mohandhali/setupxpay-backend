const axios = require('axios');

const BASE_URL = 'https://setupxpay-backend.onrender.com';

async function testSignup() {
  console.log('🧪 Testing SetupXPay Signup...\n');

  const testData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  try {
    console.log('Testing signup with data:', { ...testData, password: '***' });
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Signup successful:', {
      message: signupRes.data.message,
      user: signupRes.data.user,
      hasWallet: !!signupRes.data.wallet
    });
  } catch (error) {
    console.log('❌ Signup failed:', error.response?.status, error.response?.data || error.message);
  }
}

testSignup().catch(console.error); 