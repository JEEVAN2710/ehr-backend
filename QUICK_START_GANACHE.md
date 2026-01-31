# 🚀 Quick Start - Ganache Local Development

## What You Need To Do Now

### 1️⃣ Install Ganache (5 minutes)

**Download Ganache GUI:**
- Go to: https://trufflesuite.com/ganache/
- Download for Windows
- Install and open

**OR use CLI:**
```bash
npm install -g ganache
```

---

### 2️⃣ Get a Private Key from Ganache

**Using Ganache GUI:**
1. Open Ganache
2. Click "Quickstart" (Ethereum)
3. Click the key icon 🔑 next to any account
4. Copy the **Private Key** (starts with `0x`)
5. Copy the **Account Address** (also starts with `0x`)

**Using Ganache CLI:**
```bash
ganache --port 7545
# Look for "Private Keys" section in the output
# Copy the first private key
```

---

### 3️⃣ Update Your .env File

**Edit `e:\EHR\.env`:**
```bash
# Enable blockchain
BLOCKCHAIN_ENABLED=true

# Ganache connection
POLYGON_MUMBAI_RPC=http://127.0.0.1:7545

# Paste the private key and address from Ganache
WALLET_PRIVATE_KEY=0xYOUR_GANACHE_PRIVATE_KEY_HERE
WALLET_ADDRESS=0xYOUR_GANACHE_ADDRESS_HERE

# Contract address (you'll get this after deployment in next step)
BLOCKCHAIN_CONTRACT_ADDRESS=
```

---

### 4️⃣ Deploy Contract to Ganache

**Make sure Ganache is running, then:**

```bash
cd e:\EHR\blockchain

# Compile the smart contract
npm run compile

# Deploy to Ganache
npm run deploy:ganache
```

**You'll see output like:**
```
✅ Contract deployed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contract Address: 0xABC123...
Network: Ganache (local)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Update your .env file:
BLOCKCHAIN_CONTRACT_ADDRESS=0xABC123...
```

**Copy that contract address!**

---

### 5️⃣ Update .env with Contract Address

**Add to `e:\EHR\.env`:**
```bash
BLOCKCHAIN_CONTRACT_ADDRESS=0xABC123_PASTE_YOUR_CONTRACT_ADDRESS
```

---

### 6️⃣ Start Everything

**Terminal 1 - Ganache (if using CLI):**
```bash
ganache --port 7545
# Or just keep Ganache GUI open
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

---

### 7️⃣ Test Blockchain Features

1. **Open frontend:** http://localhost:5173
2. **Register/Login** as a doctor
3. **Create a medical record**
4. **Click on the record** to view it
5. **Click "Blockchain Audit" tab** 
6. **See the transaction!** ✨

**In Ganache GUI:**
- Go to "Transactions" tab
- You'll see the blockchain transaction for the record creation!

---

## ✅ Verification Checklist

- [ ] Ganache is installed and running
- [ ] Private key copied to .env
- [ ] Contract compiled successfully
- [ ] Contract deployed to Ganache
- [ ] Contract address added to .env
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can create a medical record
- [ ] Blockchain audit tab shows transaction
- [ ] Transaction visible in Ganache GUI

---

## 🎯 Next: Production Deployment

**When ready to deploy to production:**

1. **Backend on Render:**
   - Set `BLOCKCHAIN_ENABLED=false`
   - Deploy backend without blockchain
   - See: `RENDER_DEPLOYMENT.md`

2. **Frontend on Vercel:**
   - Deploy as usual
   - No blockchain changes needed

---

## 📚 Detailed Documentation

- **Full Setup:** `COMPLETE_SETUP.md`
- **Ganache Details:** `GANACHE_SETUP.md`
- **Render Deployment:** `RENDER_DEPLOYMENT.md`
- **OTP Logging:** `RENDER_OTP_LOGGING.md`

---

## 🆘 Troubleshooting

### "Contract deployment failed"
- Make sure Ganache is running on port 7545
- Check private key is set in .env
- Try installing dependencies in blockchain folder: `cd blockchain && npm install`

### "Blockchain initialization failed"
- Verify `BLOCKCHAIN_ENABLED=true` in .env
- Check contract address is set correctly
- Restart backend with `npm run dev`

### "Can't see blockchain audit"
- Create a NEW record (old records won't have blockchain audit)
- Check backend logs for blockchain errors
- Verify Ganache is still running

---

**🎉 You're all set! Start with step 1 above.**
