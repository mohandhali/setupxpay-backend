const axios = require('axios');

const BASE_URL = 'https://setupxpay-backend.onrender.com';

// Test BEP20 USDT send
async function testBEP20Send() {
  try {
    console.log('🧪 Testing BEP20 USDT send...');
    
    // Test data
    const testData = {
      fromPrivateKey: "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad", // Your testnet private key
      to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Test recipient address
      amount: "0.1", // Small amount for testing
      userId: "test_user_id",
      network: "bep20"
    };
    
    console.log('📤 Sending request with data:', {
      to: testData.to,
      amount: testData.amount,
      network: testData.network
    });
    
    const response = await axios.post(`${BASE_URL}/send-usdt`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ BEP20 send successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ BEP20 send failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.data?.details) {
      console.error('Details:', JSON.stringify(error.response.data.details, null, 2));
    }
  }
}

// Test BEP20 balance check
async function testBEP20Balance() {
  try {
    console.log('🧪 Testing BEP20 balance check...');
    
    const address = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Test address
    
    const response = await axios.get(`${BASE_URL}/get-balance/${address}`);
    
    console.log('✅ Balance check successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Balance check failed:');
    console.error('Error:', error.response?.data || error.message);
  }
}

// Test rate fetching
async function testRates() {
  try {
    console.log('🧪 Testing rate fetching...');
    
    const response = await axios.get(`${BASE_URL}/rate`);
    
    console.log('✅ Rate fetch successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Rate fetch failed:');
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting BEP20 tests...\n');
  
  await testRates();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testBEP20Balance();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testBEP20Send();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('🏁 Tests completed!');
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testBEP20Send, testBEP20Balance, testRates }; 