const axios = require('axios');

const BASE_URL = 'https://setupxpay-backend.onrender.com';

// Test BEP20 USDT transfer on testnet
async function testBEP20USDTTransfer() {
  try {
    console.log('🧪 Testing BEP20 USDT transfer on testnet...');
    
    // Test data for BSC testnet
    const testData = {
      fromPrivateKey: "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad", // Your testnet private key
      to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Test recipient address
      amount: "1", // 1 USDT for testing
      userId: "test_user_id",
      network: "bep20"
    };
    
    console.log('📤 Sending BEP20 USDT transfer request...');
    console.log('Contract: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd (BSC Testnet USDT)');
    console.log('Amount:', testData.amount, 'USDT');
    console.log('To:', testData.to);
    
    const response = await axios.post(`${BASE_URL}/send-usdt`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ BEP20 USDT transfer successful!');
    console.log('Transaction ID:', response.data.txId);
    console.log('Response:', response.data);
    
    // Check transaction on BSC testnet explorer
    console.log('\n🔍 Check transaction on:');
    console.log(`https://testnet.bscscan.com/tx/${response.data.txId}`);
    
  } catch (error) {
    console.error('❌ BEP20 USDT transfer failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.data?.details) {
      console.error('Details:', JSON.stringify(error.response.data.details, null, 2));
    }
    
    // Common BEP20 errors and solutions
    if (error.response?.data?.error?.includes('insufficient')) {
      console.log('\n💡 Solution: Add more BNB to your wallet for gas fees');
      console.log('   - Minimum 0.002 BNB required');
      console.log('   - Current balance might be low');
    }
    
    if (error.response?.data?.error?.includes('invalid')) {
      console.log('\n💡 Solution: Check contract address and parameters');
      console.log('   - Contract: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd');
      console.log('   - Amount should be > 0');
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

// Test BEP20 wallet generation
async function testBEP20WalletGeneration() {
  try {
    console.log('🧪 Testing BEP20 wallet generation...');
    
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      name: "Test User BEP20",
      email: "testbep20@example.com",
      password: "testpass123"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ BEP20 wallet generation successful!');
    console.log('User ID:', response.data.user._id);
    console.log('TRC20 Address:', response.data.user.walletAddress);
    console.log('BEP20 Address:', response.data.user.bep20Address);
    
  } catch (error) {
    console.error('❌ BEP20 wallet generation failed:');
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting BEP20 Testnet Tests...\n');
  
  await testBEP20WalletGeneration();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testBEP20Balance();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testBEP20USDTTransfer();
  console.log('\n' + '='.repeat(60) + '\n');
  
  console.log('🏁 All BEP20 tests completed!');
}

// Run if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { testBEP20USDTTransfer, testBEP20Balance, testBEP20WalletGeneration }; 