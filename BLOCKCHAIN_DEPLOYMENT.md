# 🚀 Blockchain Deployment Guide

**Quick Start: Deploy Your EHR Smart Contract to Polygon Mumbai (FREE)**

---

## ⚡ Quick Setup (5-10 minutes)

### Step 1: Create a Wallet

**Option A: Use existing MetaMask wallet**
- Export your private key from MetaMask
- Copy wallet address

**Option B: Generate new wallet**
```bash
cd blockchain
node scripts/create-wallet.js
```
Save the output!

### Step 2: Add Wallet to .env

Add these lines to `e:\EHR\.env`:
```
BLOCKCHAIN_ENABLED=true
WALLET_ADDRESS=<your-wallet-address>
WALLET_PRIVATE_KEY=<your-private-key>
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
```

### Step 3: Get Free Test MATIC

1. Go to: https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Paste your wallet address
4. Click "Submit"
5. Wait 1-2 minutes

**Verify you got MATIC:**
```bash
cd blockchain
node scripts/check-balance.js
```

### Step 4: Deploy Contract

```bash
cd blockchain
npx hardhat run scripts/deploy-mumbai.js --network mumbai
```

**Expected output:**
```
✅ CONTRACT DEPLOYED!
📍 Contract Address: 0x...
🔗 View on PolygonScan: https://mumbai.polygonscan.com/address/0x...

📝 Update your .env file:
   BLOCKCHAIN_CONTRACT_ADDRESS=0x...
```

### Step 5: Update .env

Copy the contract address to your `.env` file:
```
BLOCKCHAIN_CONTRACT_ADDRESS=<contract-address-from-step-4>
```

### Step 6: Start Backend

```bash
cd e:\EHR
npm run dev
```

**You should see:**
```
🔗 Initializing blockchain...
✅ Blockchain connected
   Network: maticmum (Chain ID: 80001)
   Contract: 0x...
   Wallet: 0x...
   Balance: 0.2 MATIC
```

---

## ✅ That's It!

Your EHR system now:
- ✅ Logs all record operations to blockchain
- ✅ Creates tamper-proof audit trail
- ✅ Allows integrity verification
- ✅ Provides public PolygonScan links

---

## 🔍 Verify It's Working

1. Create a medical record via your frontend
2. Check backend logs for:
   ```
   📝 Audit logged: CREATE for record ...
      TX: https://mumbai.polygonscan.com/tx/0x...
   ```
3. Click the transaction link
4. See your transaction on PolygonScan!

---

## 🛑 Troubleshooting

**"No MATIC"**  
- Get more from faucet: https://faucet.polygon.technology/

**"Contract ABI not found"**  
- Run: `cd blockchain && npx hardhat compile`

**"Blockchain disabled"**  
- Check `.env` has `BLOCKCHAIN_ENABLED=true`

**"Transaction failed"**  
- Check wallet has enough MATIC for gas fees

---

## 💡 Tips

- Blockchain is OPTIONAL - app works without it
- Gas fees are FREE on Mumbai testnet
- Each transaction takes ~5-10 seconds
- Keep your private key secure!

---

## 📚 What's Next?

The blockchain integration is now complete! Every time you:
- Create a record → Logged to blockchain
- Update a record → Logged to blockchain
- Delete a record → Logged to blockchain

All audits are permanent, immutable, and publicly verifiable on PolygonScan.

Frontend audit trail visualization coming next! 🎨
