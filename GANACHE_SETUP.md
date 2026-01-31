# Ganache Blockchain Setup Guide

## Overview
Use Ganache for local blockchain development and testing. Production deployments run without blockchain.

## Installation

### Option 1: Ganache GUI (Recommended for Visual Testing)
1. Download from: https://trufflesuite.com/ganache/
2. Install and run
3. Create a new workspace or use Quickstart
4. Note the RPC Server URL (default: `HTTP://127.0.0.1:7545`)

### Option 2: Ganache CLI
```bash
npm install -g ganache
ganache --port 7545
```

## Configuration

### 1. Local Environment Setup

**`.env` file for local development:**
```bash
# Enable blockchain locally
BLOCKCHAIN_ENABLED=true

# Ganache connection
POLYGON_MUMBAI_RPC=http://127.0.0.1:7545

# Use Ganache default account
WALLET_PRIVATE_KEY=0x<ganache_private_key>
WALLET_ADDRESS=0x<ganache_address>

# Contract address (after deployment)
BLOCKCHAIN_CONTRACT_ADDRESS=<deployed_contract_address>
```

### 2. Deploy Contract to Ganache

**Terminal 1 - Start Ganache:**
```bash
# If using CLI
ganache --port 7545

# Or open Ganache GUI
```

**Terminal 2 - Compile and Deploy:**
```bash
cd e:\EHR\blockchain
npx hardhat compile
npx hardhat run scripts/deploy-local.js --network ganache
```

**Create `deploy-local.js` if needed:**
```javascript
async function main() {
  const MedicalAuditTrail = await ethers.getContractFactory("MedicalAuditTrail");
  const contract = await MedicalAuditTrail.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);
  console.log("\nAdd to .env:");
  console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### 3. Configure Hardhat for Ganache

**Update `blockchain/hardhat.config.cjs`:**
```javascript
module.exports = {
  solidity: "0.8.19",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        // Copy private key from Ganache
        "0x<private_key_from_ganache>"
      ]
    }
  }
};
```

## Local Testing Workflow

### Start All Services

**Terminal 1 - Ganache:**
```bash
ganache --port 7545
# Or use GUI
```

**Terminal 2 - Backend:**
```bash
cd e:\EHR
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd e:\EHR\frontend
npm run dev
```

### Test Blockchain Features

1. Register/Login as doctor
2. Create a medical record
3. View the record → Click "Blockchain Audit" tab
4. See the CREATE transaction in timeline
5. Check Ganache GUI/terminal for transaction

## Production Deployment

### Backend (Render)

**Environment Variables:**
```bash
# IMPORTANT: Disable blockchain
BLOCKCHAIN_ENABLED=false

# All other variables (MongoDB, JWT, SMTP, S3, etc.)
NODE_ENV=production
MONGO_URI=your_mongodb_uri
# ... rest of your env vars
```

### Frontend (Vercel)

No changes needed - just deploy as usual.

### Build Commands

**Backend:**
- Build: `npm install`
- Start: `npm start`

**Frontend:**
- Build: `npm run build`
- Start: `npm run preview` (or Vercel auto-handles)

## Differences: Ganache vs Hardhat

| Feature | Ganache | Hardhat Node |
|---------|---------|--------------|
| **GUI** | ✅ Available | ❌ CLI only |
| **Port** | 7545 (default) | 8545 (default) |
| **Accounts** | 10 pre-funded | 20 pre-funded |
| **Visual Logs** | ✅ Transaction viewer | ❌ Console only |
| **Speed** | Fast | Very fast |
| **Best For** | Visual testing | CI/CD pipelines |

## Troubleshooting

### Contract Deployment Fails
- Ensure Ganache is running
- Check RPC URL matches (7545 vs 8545)
- Verify private key in hardhat.config.cjs

### Backend Can't Connect
- Verify `BLOCKCHAIN_ENABLED=true` in `.env`
- Check `POLYGON_MUMBAI_RPC=http://127.0.0.1:7545`
- Restart backend after config changes

### Transactions Not Showing
- Confirm contract is deployed
- Check `BLOCKCHAIN_CONTRACT_ADDRESS` is set
- Verify wallet has ETH balance in Ganache

## Demo Preparation

1. **Start Ganache GUI** - Show visual dashboard
2. **Deploy contract** - Point out contract creation
3. **Create record** - Show transaction in Ganache
4. **View audit trail** - Demonstrate frontend integration
5. **Explain production** - "Same code, just disabled for hosting"

## Important Notes

- ✅ Ganache is for LOCAL development only
- ✅ Production runs WITHOUT blockchain
- ✅ All blockchain code remains in codebase
- ✅ Easy to switch between modes with env variable
- ✅ Can enable blockchain later with real network

## Next Steps

1. Install Ganache
2. Configure hardhat.config.cjs
3. Deploy contract to Ganache
4. Update .env with contract address
5. Test locally with all features
6. Deploy to production with blockchain disabled
