const axios = require("axios");

const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b"; // replace with your real Tatum key
const PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad"; // funded wallet
const FROM_ADDRESS = "TTpuKGbuznUVWN5KM6zxNsbLuPxJRFZDHm";
const TO_ADDRESS = "TYdt3VMoJxcTeCt77Uvt4iTTA1iP72rKRM"; // receiver
const TOKEN_ADDRESS = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb"; // your deployed token
const AMOUNT = "100"; // in token units

const sendToken = async () => {
  try {
    const response = await axios.post(
      "https://api.tatum.io/v3/tron/trc20/transaction",
      {
        to: TO_ADDRESS,
        amount: AMOUNT,
        fromPrivateKey: PRIVATE_KEY,
        feeLimit: 1000,
        tokenAddress: TOKEN_ADDRESS,
      },
      {
        headers: {
          "x-api-key": TATUM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Token sent successfully");
    console.log("🔁 Transaction ID:", response.data.txId);
  } catch (error) {
    console.error("❌ Error sending token:", error.response?.data || error.message);
  }
};

sendToken();
