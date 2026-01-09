/* CommonJS deploy script to avoid ESM/HRE interop issues */
const hre = require("hardhat");

async function main() {
  const { ethers, network } = hre;

  console.log("🚀 Deploying TrustlessVote contract...\n");

  const networkName = (network && network.name) || "unknown";
  console.log("Network:", networkName);
  if (network && network.config && network.config.url) console.log("RPC:", network.config.url);

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying from account:", deployer.address);

  const provider = deployer.provider || (network && network.config && network.config.url ? new ethers.JsonRpcProvider(network.config.url) : undefined);
  const balance = await (provider || ethers.provider).getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  const TrustlessVote = await ethers.getContractFactory("TrustlessVote", deployer);
  console.log("⏳ Deploying contract...");

  const contract = await TrustlessVote.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("\n✅ TrustlessVote deployed successfully!");
  console.log("━".repeat(60));
  console.log("📋 Contract Address:", address);
  console.log("━".repeat(60));

  try {
    const fs = require("fs");
    const path = ".env.docker";
    if (fs.existsSync(path)) {
      let txt = fs.readFileSync(path, "utf8");
      if (/^VITE_CONTRACT_ADDRESS=.*$/m.test(txt)) {
        txt = txt.replace(/^VITE_CONTRACT_ADDRESS=.*$/m, `VITE_CONTRACT_ADDRESS=${address}`);
      } else {
        txt += `\nVITE_CONTRACT_ADDRESS=${address}\n`;
      }
      fs.writeFileSync(path, txt);
      console.log(`\n📝 Updated ${path} with VITE_CONTRACT_ADDRESS=${address}`);
    } else {
      console.log("\nℹ️ .env.docker not found. Please set VITE_CONTRACT_ADDRESS manually.");
    }
  } catch (e) {
    console.log("\n⚠️ Could not update .env.docker:", (e && e.message) || e);
  }

  console.log("\nYou can now start the frontend:");
  console.log("   npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
