const axios = require('axios');

const BASE_URL = 'https://setupxpay-backend.onrender.com';

async function testBackend() {
  console.log('🧪 Testing SetupXPay Backend...\n');

  try {
    // Test health endpoint
    console.log('1. Testing /health endpoint...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthRes.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.response?.status, error.response?.data || error.message);
  }

  try {
    // Test auth test endpoint
    console.log('\n2. Testing /auth/test endpoint...');
    const authTestRes = await axios.get(`${BASE_URL}/auth/test`);
    console.log('✅ Auth test passed:', authTestRes.data);
  } catch (error) {
    console.log('❌ Auth test failed:', error.response?.status, error.response?.data || error.message);
  }

  try {
    // Test signup endpoint (without data)
    console.log('\n3. Testing /auth/signup endpoint (should return 400 for missing data)...');
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {});
    console.log('❌ Signup should have failed with 400');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Signup endpoint working (correctly rejected empty data):', error.response.data);
    } else {
      console.log('❌ Signup endpoint failed:', error.response?.status, error.response?.data || error.message);
    }
  }

  console.log('\n🎯 Backend test completed!');
}

testBackend().catch(console.error); 