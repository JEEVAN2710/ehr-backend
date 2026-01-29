const { ethers } = require("ethers");

const wallet = ethers.Wallet.createRandom();

console.log("\n🔐 NEW WALLET CREATED\n");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Mnemonic:", wallet.mnemonic.phrase);
console.log("\n⚠️  SAVE THESE CREDENTIALS SECURELY!");
console.log("⚠️  NEVER share your private key or mnemonic!\n");
console.log("📝 Add to .env file:");
console.log(`WALLET_ADDRESS=${wallet.address}`);
console.log(`WALLET_PRIVATE_KEY=${wallet.privateKey}\n`);
