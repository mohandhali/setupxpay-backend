// Mainnet Configuration
export const MAINNET_CONFIG = {
  // Backend URLs
  BACKEND_URL: "https://setupxpay-backend.onrender.com", // 🔄 Replace with your mainnet backend URL
  
  // Blockchain Networks
  NETWORKS: {
    TRC20: {
      name: "TRC20 (Tron)",
      symbol: "TRC20",
      contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // Mainnet TRC20 USDT
      explorer: "https://tronscan.org/#/transaction/",
      rpc: "https://api.trongrid.io"
    },
    BEP20: {
      name: "BEP20 (BSC)",
      symbol: "BEP20", 
      contract: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // Testnet BEP20 USDT
      explorer: "https://testnet.bscscan.com/tx/",
      rpc: "https://data-seed-prebsc-1-s1.binance.org:8545"
    }
  },
  
  // Payment Gateway
  RAZORPAY: {
    key: "rzp_test_QflsX9eLx3HUJA", // 🔄 Replace with live key for mainnet
    currency: "INR"
  },
  
  // App Settings
  APP: {
    name: "SetupXPay",
    version: "1.0.0",
    environment: "mainnet"
  }
};

// Testnet Configuration (for reference)
export const TESTNET_CONFIG = {
  BACKEND_URL: "https://setupxpay-backend.onrender.com",
  NETWORKS: {
    TRC20: {
      name: "TRC20 (Tron Testnet)",
      symbol: "TRC20",
      contract: "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb", // Testnet TRC20 USDT
      explorer: "https://shasta.tronscan.org/#/transaction/",
      rpc: "https://api.shasta.trongrid.io"
    },
    BEP20: {
      name: "BEP20 (BSC Testnet)", 
      symbol: "BEP20",
      contract: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // Testnet BEP20 USDT
      explorer: "https://testnet.bscscan.com/tx/",
      rpc: "https://data-seed-prebsc-1-s1.binance.org:8545"
    }
  },
  RAZORPAY: {
    key: "rzp_test_QflsX9eLx3HUJA",
    currency: "INR"
  },
  APP: {
    name: "SetupXPay",
    version: "1.0.0", 
    environment: "testnet"
  }
};

// Export current config (change this to switch between testnet/mainnet)
export const CURRENT_CONFIG = MAINNET_CONFIG; 