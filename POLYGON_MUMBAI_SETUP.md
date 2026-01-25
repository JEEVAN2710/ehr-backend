# Polygon Mumbai Setup - Step-by-Step Guide

> Complete implementation guide to deploy your EHR blockchain to Polygon Mumbai testnet (FREE)

---

## 🎯 What We're Building

**Before:** Blockchain runs only on your local Ganache  
**After:** Blockchain runs on live Polygon Mumbai testnet (accessible 24/7, free)

**Benefits:**
- ✅ Real blockchain network (not just local)
- ✅ Show live transactions to hospitals
- ✅ View on PolygonScan explorer
- ✅ 100% FREE (testnet)
- ✅ Production-ready code

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Your existing EHR project at `e:\EHR`
- ✅ Node.js installed
- ✅ MetaMask browser extension (we'll set this up)
- ✅ 30 minutes of focused time

---

## Phase 1: Install Dependencies (5 minutes)

### Step 1: Install Blockchain Tools

Open terminal in `e:\EHR`:

```bash
cd e:\EHR

# Install Hardhat and related tools
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify

# Install blockchain libraries
npm install ethers@^6.4.0 dotenv

# Verify installation
npx hardhat --version
```

**Expected output:**
```
✓ Hardhat version 2.19.x
```

---

### Step 2: Initialize Hardhat Project

```bash
# Create blockchain directory
mkdir blockchain
cd blockchain

# Initialize Hardhat (JavaScript project)
npx hardhat init
```

**When prompted:**
- Select: `Create a JavaScript project`
- Project root: `./blockchain` (press Enter)
- Add .gitignore: `y`
- Install dependencies: `y`

**This creates:**
```
blockchain/
├── contracts/
├── scripts/
├── test/
├── hardhat.config.js
└── .gitignore
```

---

## Phase 2: Create Wallet & Get Test MATIC (10 minutes)

### Step 3: Create a Wallet

**Option A: If you have MetaMask**

1. Open MetaMask extension
2. Click on account icon → Settings → Security & Privacy
3. Click "Reveal Secret Recovery Phrase"
4. Enter password
5. **COPY THE 12 WORDS** (keep private!)
6. Click your account → Export Private Key
7. Enter password
8. **COPY THE PRIVATE KEY** (starts with 0x...)

**Option B: Create New Wallet Programmatically**

Create `blockchain/scripts/create-wallet.js`:

```javascript
const { ethers } = require("ethers");

const wallet = ethers.Wallet.createRandom();

console.log("\n🔐 NEW WALLET CREATED\n");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Mnemonic:", wallet.mnemonic.phrase);
console.log("\n⚠️  SAVE THESE CREDENTIALS SECURELY!\n");
```

Run:
```bash
node scripts/create-wallet.js
```

**Save the output!** You'll need:
- ✅ Wallet address (0x...)
- ✅ Private key (0x...)

---

### Step 4: Get Free Test MATIC

**Method 1: Polygon Faucet (Recommended)**

1. Go to: https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Paste your wallet address
4. Click "Submit"
5. Wait 1-2 minutes
6. You'll receive 0.2 MATIC (free!)

**Method 2: Alchemy Faucet (Backup)**

1. Go to: https://mumbaifaucet.com/
2. Enter wallet address
3. Complete captcha
4. Receive MATIC

**Verify you got MATIC:**

Create `blockchain/scripts/check-balance.js`:

```javascript
const { ethers } = require("ethers");
require('dotenv').config({ path: '../.env' });

async function checkBalance() {
  const provider = new ethers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
  const address = process.env.WALLET_ADDRESS;
  
  const balance = await provider.getBalance(address);
  const balanceInMatic = ethers.formatEther(balance);
  
  console.log(`\n💰 Balance: ${balanceInMatic} MATIC\n`);
  
  if (parseFloat(balanceInMatic) > 0) {
    console.log("✅ You have MATIC! Ready to deploy.\n");
  } else {
    console.log("❌ No MATIC. Please get from faucet.\n");
  }
}

checkBalance();
```

Run:
```bash
node scripts/check-balance.js
```

---

## Phase 3: Configure Hardhat for Mumbai (5 minutes)

### Step 5: Update Environment Variables

Add to `e:\EHR\.env`:

```bash
# Polygon Mumbai Configuration
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
WALLET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
WALLET_ADDRESS=0xYOUR_WALLET_ADDRESS_HERE
POLYGONSCAN_API_KEY=ABC123  # Optional, for contract verification

# Blockchain Contract (will be set after deployment)
BLOCKCHAIN_CONTRACT_ADDRESS=
BLOCKCHAIN_ENABLED=true
```

**Replace:**
- `YOUR_PRIVATE_KEY_HERE` with your actual private key
- `YOUR_WALLET_ADDRESS_HERE` with your wallet address

---

### Step 6: Configure Hardhat

Edit `blockchain/hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config({ path: "../.env" });

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: 35000000000, // 35 gwei
      gas: 2100000
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN_API_KEY
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
```

---

## Phase 4: Create Smart Contract (Already Done!)

### Step 7: Copy Smart Contract

The smart contract from `BLOCKCHAIN_IMPLEMENTATION_STEPS.md` works perfectly. Create `blockchain/contracts/MedicalAuditTrail.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MedicalAuditTrail {
    
    struct AuditEntry {
        string recordId;
        string action;
        address userAddress;
        string userId;
        bytes32 dataHash;
        uint256 timestamp;
        string metadata;
    }
    
    AuditEntry[] public auditLog;
    mapping(string => uint256[]) public recordAudits;
    mapping(string => bytes32) public recordHashes;
    
    event AuditLogged(
        string indexed recordId,
        string action,
        address indexed userAddress,
        uint256 timestamp,
        bytes32 dataHash
    );
    
    event RecordHashUpdated(
        string indexed recordId,
        bytes32 oldHash,
        bytes32 newHash,
        uint256 timestamp
    );
    
    function logAudit(
        string memory _recordId,
        string memory _action,
        string memory _userId,
        bytes32 _dataHash,
        string memory _metadata
    ) public returns (uint256) {
        
        AuditEntry memory entry = AuditEntry({
            recordId: _recordId,
            action: _action,
            userAddress: msg.sender,
            userId: _userId,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            metadata: _metadata
        });
        
        auditLog.push(entry);
        uint256 auditIndex = auditLog.length - 1;
        recordAudits[_recordId].push(auditIndex);
        
        bytes32 oldHash = recordHashes[_recordId];
        recordHashes[_recordId] = _dataHash;
        
        emit AuditLogged(_recordId, _action, msg.sender, block.timestamp, _dataHash);
        
        if (oldHash != bytes32(0)) {
            emit RecordHashUpdated(_recordId, oldHash, _dataHash, block.timestamp);
        }
        
        return auditIndex;
    }
    
    function getRecordAudits(string memory _recordId) 
        public 
        view 
        returns (AuditEntry[] memory) 
    {
        uint256[] memory indices = recordAudits[_recordId];
        AuditEntry[] memory entries = new AuditEntry[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            entries[i] = auditLog[indices[i]];
        }
        
        return entries;
    }
    
    function verifyRecordIntegrity(string memory _recordId, bytes32 _currentHash) 
        public 
        view 
        returns (bool isValid, bytes32 storedHash) 
    {
        storedHash = recordHashes[_recordId];
        isValid = (storedHash == _currentHash);
        return (isValid, storedHash);
    }
    
    function getAuditCount() public view returns (uint256) {
        return auditLog.length;
    }
    
    function getAudit(uint256 index) public view returns (AuditEntry memory) {
        require(index < auditLog.length, "Index out of bounds");
        return auditLog[index];
    }
}
```

---

## Phase 5: Deploy to Mumbai (5 minutes)

### Step 8: Compile Contract

```bash
cd blockchain
npx hardhat compile
```

**Expected output:**
```
✓ Compiled 1 Solidity file successfully
```

---

### Step 9: Create Deployment Script

Create `blockchain/scripts/deploy-mumbai.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Deploying to Polygon Mumbai...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("📍 Deployer address:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "MATIC\n");

  if (balance === 0n) {
    console.log("❌ No MATIC! Get from faucet first.");
    return;
  }

  // Deploy contract
  console.log("⏳ Deploying MedicalAuditTrail...");
  const MedicalAuditTrail = await hre.ethers.getContractFactory("MedicalAuditTrail");
  const auditTrail = await MedicalAuditTrail.deploy();
  
  await auditTrail.waitForDeployment();
  const address = await auditTrail.getAddress();

  console.log("\n✅ CONTRACT DEPLOYED!");
  console.log("📍 Contract Address:", address);
  console.log("\n🔗 View on PolygonScan:");
  console.log(`   https://mumbai.polygonscan.com/address/${address}`);
  
  console.log("\n📝 Update your .env file:");
  console.log(`   BLOCKCHAIN_CONTRACT_ADDRESS=${address}`);
  console.log("\n✅ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

### Step 10: Deploy!

```bash
npx hardhat run scripts/deploy-mumbai.js --network mumbai
```

**Expected output:**
```
🚀 Deploying to Polygon Mumbai...

📍 Deployer address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
💰 Balance: 0.2 MATIC

⏳ Deploying MedicalAuditTrail...

✅ CONTRACT DEPLOYED!
📍 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

🔗 View on PolygonScan:
   https://mumbai.polygonscan.com/address/0x5FbDB2315678afecb367f032d93F642f64180aa3

📝 Update your .env file:
   BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

✅ Deployment complete!
```

**SAVE THE CONTRACT ADDRESS!** Copy it to your `.env` file.

---

## Phase 6: Backend Integration (5 minutes)

### Step 11: Create Blockchain Service

Create `src/services/blockchainService.js`:

```javascript
import { ethers } from 'ethers';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load contract ABI
const contractPath = path.join(__dirname, '../../blockchain/artifacts/contracts/MedicalAuditTrail.sol/MedicalAuditTrail.json');
const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const CONTRACT_ABI = contractJSON.abi;

// Configuration
const CONTRACT_ADDRESS = process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.POLYGON_MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com';
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || '';
const ENABLED = process.env.BLOCKCHAIN_ENABLED === 'true';

let provider;
let signer;
let contract;

/**
 * Initialize blockchain connection
 */
export const initBlockchain = async () => {
  if (!ENABLED) {
    console.log('ℹ️  Blockchain disabled (BLOCKCHAIN_ENABLED=false)');
    return false;
  }

  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    signer = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    const network = await provider.getNetwork();
    console.log('✅ Blockchain connected');
    console.log('   Network:', network.name, `(Chain ID: ${network.chainId})`);
    console.log('   Contract:', CONTRACT_ADDRESS);
    console.log('   Wallet:', signer.address);
    
    return true;
  } catch (error) {
    console.error('❌ Blockchain connection failed:', error.message);
    return false;
  }
};

/**
 * Generate SHA-256 hash of data
 */
export const generateHash = (data) => {
  const jsonString = JSON.stringify(data);
  return '0x' + crypto.createHash('sha256').update(jsonString).digest('hex');
};

/**
 * Log audit to blockchain
 */
export const logAudit = async (recordId, action, userId, data, metadata = {}) => {
  if (!ENABLED || !contract) {
    return { success: false, error: 'Blockchain not enabled' };
  }

  try {
    const dataHash = generateHash(data);
    const metadataString = JSON.stringify(metadata);

    const tx = await contract.logAudit(
      recordId.toString(),
      action,
      userId.toString(),
      dataHash,
      metadataString,
      {
        gasLimit: 500000 // Prevent out of gas errors
      }
    );

    const receipt = await tx.wait();

    console.log(`📝 Audit logged: ${action} for record ${recordId}`);
    console.log(`   TX: https://mumbai.polygonscan.com/tx/${receipt.hash}`);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://mumbai.polygonscan.com/tx/${receipt.hash}`
    };
  } catch (error) {
    console.error('❌ Audit logging failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify record integrity
 */
export const verifyIntegrity = async (recordId, currentData) => {
  if (!ENABLED || !contract) {
    return { success: false, error: 'Blockchain not enabled' };
  }

  try {
    const currentHash = generateHash(currentData);
    const [isValid, storedHash] = await contract.verifyRecordIntegrity(
      recordId.toString(),
      currentHash
    );

    return {
      success: true,
      isValid,
      currentHash,
      storedHash,
      matches: isValid
    };
  } catch (error) {
    console.error('❌ Integrity verification failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get audit history for a record
 */
export const getRecordAudits = async (recordId) => {
  if (!ENABLED || !contract) {
    return { success: false, error: 'Blockchain not enabled' };
  }

  try {
    const audits = await contract.getRecordAudits(recordId.toString());

    return {
      success: true,
      audits: audits.map(audit => ({
        recordId: audit.recordId,
        action: audit.action,
        userAddress: audit.userAddress,
        userId: audit.userId,
        dataHash: audit.dataHash,
        timestamp: new Date(Number(audit.timestamp) * 1000),
        metadata: JSON.parse(audit.metadata || '{}')
      }))
    };
  } catch (error) {
    console.error('❌ Failed to get audits:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get total audit count
 */
export const getAuditCount = async () => {
  if (!ENABLED || !contract) {
    return { success: false, error: 'Blockchain not enabled' };
  }

  try {
    const count = await contract.getAuditCount();
    return {
      success: true,
      count: Number(count)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  initBlockchain,
  logAudit,
  verifyIntegrity,
  getRecordAudits,
  getAuditCount,
  generateHash
};
```

---

### Step 12: Update App.js

Edit `src/app.js` - add blockchain initialization:

```javascript
import { initBlockchain } from './services/blockchainService.js';

// Add after other imports, before app creation
(async () => {
  console.log('\n🔗 Initializing blockchain...');
  await initBlockchain();
})();
```

---

### Step 13: Integrate with Record Controller

Edit existing `src/controllers/recordController.js` - add to createRecord:

```javascript
import { logAudit } from '../services/blockchainService.js';

export const createRecord = async (req, res) => {
  try {
    // ... existing record creation code ...
    const record = await MedicalRecord.create({...});

    // Log to blockchain (async, don't block response)
    logAudit(
      record._id,
      'CREATE',
      req.user.id,
      {
        title: record.title,
        description: record.description,
        patientId: record.patientId.toString(),
        recordType: record.recordType
      },
      {
        createdBy: req.user.email,
        role: req.user.role
      }
    ).catch(err => console.error('Blockchain error:', err));

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## Phase 7: Testing (5 minutes)

### Step 14: Start Your Backend

```bash
cd e:\EHR
npm run dev
```

**You should see:**
```
🔗 Initializing blockchain...
✅ Blockchain connected
   Network: maticmum (Chain ID: 80001)
   Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

Server running on port 5000
```

---

### Step 15: Test Creating a Record

Use your existing frontend or Postman:

**POST** `http://localhost:5000/api/records`

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Body:
```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "title": "Blockchain Test Record",
  "description": "Testing Polygon Mumbai integration",
  "recordType": "report"
}
```

**Expected backend logs:**
```
📝 Audit logged: CREATE for record 67890...
   TX: https://mumbai.polygonscan.com/tx/0xabc123...
```

---

### Step 16: View on PolygonScan

1. Copy the transaction URL from logs
2. Open in browser
3. You'll see:
   - ✅ Transaction successful
   - ✅ Block number
   - ✅ Gas used
   - ✅ Your contract interaction

**This is LIVE blockchain!** 🎉

---

## 🎉 Success Checklist

You're done when you can check all these:

- [ ] Smart contract deployed to Mumbai
- [ ] Contract visible on PolygonScan
- [ ] Backend connects to Mumbai
- [ ] Creating record generates blockchain transaction
- [ ] Transaction visible on PolygonScan explorer
- [ ] No errors in console

---

## 📊 What You Can Now Demo to Hospitals

### Live Blockchain Features

1. **Immutable Audit Trail**
   -Show PolygonScan transaction
   - "This is on a live blockchain, used by Fortune 500 companies"

2. **Data Integrity**
   - Create record → hash stored on blockchain
   - Modify record → integrity check fails
   - "Tamper-proof medical records"

3. **Cost Effective**
   - "Running on Polygon Mumbai testnet"
   - "Production cost: $5-50/month vs $50,000 on Ethereum"

4. **Professional Infrastructure**
   - "Same technology as Starbucks, Adobe, Reddit"
   - "Can scale to 65,000 transactions/second"

---

## 🔧 Troubleshooting

### "Insufficient funds for gas"
- **Solution:** Get more MATIC from faucet (https://faucet.polygon.technology/)

### "Nonce too high"
- **Solution:** Wait 1 minute and try again (Mumbai can be slow)

### "Contract not deployed"
- **Solution:** Check CONTRACT_ADDRESS in .env matches deployment output

### "RPC Error"
- **Solution:** Try alternative RPC: `https://matic-mumbai.chainstacklabs.com`

---

## 🚀 Next Steps

**Now that Mumbai is working:**

1. **Test all features:**
   - Create records → blockchain audit
   - Share records → blockchain audit  
   - Delete records → blockchain audit

2. **Create demo script** (see BLOCKCHAIN_IMPLEMENTATION_STEPS.md)

3. **Prepare hospital pitch:**
   - Show live PolygonScan transactions
   - Demonstrate tampering detection
   - Explain cost savings

4. **Optional: Verify contract** on PolygonScan:
   ```bash
   npx hardhat verify --network mumbai YOUR_CONTRACT_ADDRESS
   ```

---

## 📞 Support

**Polygon Mumbai Resources:**
- RPC URL: https://rpc-mumbai.maticvigil.com
- Faucet: https://faucet.polygon.technology/
- Explorer: https://mumbai.polygonscan.com
- Docs: https://docs.polygon.technology/

**Need help?** Check the transaction on PolygonScan for detailed error messages.

---

**Ready to deploy to production Polygon mainnet?** Only takes $50 setup and uses same code! 🎉
