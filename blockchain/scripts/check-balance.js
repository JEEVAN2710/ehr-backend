const { ethers } = require("ethers");
require('dotenv').config({ path: '../.env' });

async function checkBalance() {
    const provider = new ethers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
    const address = process.env.WALLET_ADDRESS;

    if (!address) {
        console.log("\n❌ WALLET_ADDRESS not set in .env file\n");
        return;
    }

    console.log("\n🔍 Checking balance for:", address);

    try {
        const balance = await provider.getBalance(address);
        const balanceInMatic = ethers.formatEther(balance);

        console.log(`💰 Balance: ${balanceInMatic} MATIC\n`);

        if (parseFloat(balanceInMatic) > 0) {
            console.log("✅ You have MATIC! Ready to deploy.\n");
        } else {
            console.log("❌ No MATIC. Please get from faucet:");
            console.log("   https://faucet.polygon.technology/\n");
        }
    } catch (error) {
        console.error("❌ Error:", error.message, "\n");
    }
}

checkBalance();
