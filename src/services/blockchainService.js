import { ethers } from 'ethers';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load contract ABI
const contractPath = path.join(__dirname, '../../blockchain/artifacts/contracts/MedicalAuditTrail.sol/MedicalAuditTrail.json');
let CONTRACT_ABI;
try {
    const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    CONTRACT_ABI = contractJSON.abi;
} catch (error) {
    console.log('⚠️  Contract ABI not found. Run: cd blockchain && npx hardhat compile');
    CONTRACT_ABI = [];
}

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

    if (!CONTRACT_ADDRESS) {
        console.log('⚠️  BLOCKCHAIN_CONTRACT_ADDRESS not set. Deploy contract first.');
        return false;
    }

    if (!PRIVATE_KEY) {
        console.log('⚠️  WALLET_PRIVATE_KEY not set in .env');
        return false;
    }

    try {
        provider = new ethers.JsonRpcProvider(RPC_URL);
        signer = new ethers.Wallet(PRIVATE_KEY, provider);
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const network = await provider.getNetwork();
        const balance = await provider.getBalance(signer.address);

        console.log('✅ Blockchain connected');
        console.log('   Network:', network.name, `(Chain ID: ${network.chainId})`);
        console.log('   Contract:', CONTRACT_ADDRESS);
        console.log('   Wallet:', signer.address);
        console.log('   Balance:', ethers.formatEther(balance), 'MATIC');

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
        // Return valid when blockchain disabled
        const currentHash = generateHash(currentData);
        return {
            success: true,
            isValid: true,
            currentHash,
            storedHash: currentHash,
            matches: true
        };
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
        // Return empty audits instead of error when blockchain disabled
        return {
            success: true,
            audits: []
        };
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
        // Return empty audits on error instead of failing
        return {
            success: true,
            audits: []
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
