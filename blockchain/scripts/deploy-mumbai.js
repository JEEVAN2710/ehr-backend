const hre = require("hardhat");

async function main() {
    const network = hre.network.name;
    console.log(`\n🚀 Deploying to ${network}...\n`);

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log("📍 Deployer address:", deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Note: Local Hardhat network has 10000 ETH by default
    // Mumbai requires getting MATIC from faucet

    // Deploy contract
    console.log("⏳ Deploying MedicalAuditTrail...");
    const MedicalAuditTrail = await hre.ethers.getContractFactory("MedicalAuditTrail");
    const auditTrail = await MedicalAuditTrail.deploy();

    await auditTrail.waitForDeployment();
    const address = await auditTrail.getAddress();

    console.log("\n✅ CONTRACT DEPLOYED!");
    console.log("📍 Contract Address:", address);

    if (network === "mumbai") {
        console.log("\n🔗 View on PolygonScan:");
        console.log(`   https://mumbai.polygonscan.com/address/${address}`);
    } else if (network === "polygon") {
        console.log("\n🔗 View on PolygonScan:");
        console.log(`   https://polygonscan.com/address/${address}`);
    } else if (network === "hardhat" || network === "localhost") {
        console.log("\n🔗 Deployed to local network (no block explorer)");
    }

    console.log("\n📝 Add to your .env file:");
    console.log(`BLOCKCHAIN_ENABLED=true`);
    console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${address}`);

    if (network === "hardhat" || network === "localhost") {
        console.log(`POLYGON_MUMBAI_RPC=http://127.0.0.1:8545`);
        console.log(`WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`);
        console.log(`WALLET_ADDRESS=${deployer.address}`);
    }

    console.log("\n✅ Deployment complete!\n");

    // Test the contract
    console.log("🧪 Testing contract...");
    const tx = await auditTrail.logAudit(
        "test_record_001",
        "CREATE",
        "test_user_001",
        "0x" + "a".repeat(64),
        '{"test": true, "network": "' + network + '"}'
    );
    const receipt = await tx.wait();
    console.log("✅ Test audit logged successfully!");
    console.log(`   Transaction hash: ${receipt.hash}\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
