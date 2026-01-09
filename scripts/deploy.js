import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying TrustlessVote contract...\n");
  console.log("Network:", hre.network.name);
  if (hre.network?.config?.url) console.log("RPC:", hre.network.config.url);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying from account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // Deploy contract
  const TrustlessVote = await hre.ethers.getContractFactory("TrustlessVote");
  console.log("⏳ Deploying contract...");
  
  const contract = await TrustlessVote.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  
  console.log("\n✅ TrustlessVote deployed successfully!");
  console.log("━".repeat(60));
  console.log("📋 Contract Address:", address);
  console.log("━".repeat(60));
  console.log("\n📝 Next steps:");
  console.log("1. Set Vercel/Vite env var:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log("\n2. Start frontend:");
  console.log("   npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
