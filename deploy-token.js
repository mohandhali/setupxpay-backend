const axios = require("axios");

const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b";
const FROM_PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad"; // funded Shasta wallet
const FROM_ADDRESS = "TTpuKGbuznUVWN5KM6zxNsbLuPxJRFZDHm"; // same wallet as above

const deployToken = async () => {
  try {
    const response = await axios.post(
      "https://api.tatum.io/v3/tron/trc20/deploy",
      {
        symbol: "TSTX",
        name: "Test Setupx Token",
        totalSupply: 1000000, // (1M tokens with 6 decimals)
        decimals: 6,
        recipient: FROM_ADDRESS,
        fromPrivateKey: FROM_PRIVATE_KEY,
        feeLimit: 1000000000
      },
      {
        headers: {
          "x-api-key": TATUM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Token Deployed Successfully");
    console.log("🧾 Token Contract Address:", response.data);
  } catch (error) {
    console.error("❌ Failed to deploy token:", error.response?.data || error.message);
  }
};

deployToken();
