async function main() {
    console.log("Deploying MedicalAuditTrail to Ganache...\n");

    // Get the contract factory
    const MedicalAuditTrail = await ethers.getContractFactory("MedicalAuditTrail");

    // Deploy the contract
    console.log("Deploying contract...");
    const contract = await MedicalAuditTrail.deploy();

    // Wait for deployment to finish
    await contract.waitForDeployment();

    // Get the deployed contract address
    const address = await contract.getAddress();

    console.log("✅ Contract deployed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Contract Address:", address);
    console.log("Network: Ganache (local)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📝 Update your .env file:");
    console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${address}`);
    console.log("\n🎉 Ready to use! Restart your backend server.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
