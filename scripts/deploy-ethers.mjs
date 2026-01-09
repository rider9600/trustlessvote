import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import { ethers } from "ethers";

async function main() {
  console.log("🚀 Deploying TrustlessVote contract (ethers.js)\n");

  const rpcUrl = process.env.DOCKER_RPC_URL || "http://hardhat:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Hardhat default mnemonic (local dev only)
  const mnemonic = process.env.HARDHAT_MNEMONIC || "test test test test test test test test test test test junk";
  const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic).derivePath("m/44'/60'/0'/0/0").connect(provider);

  console.log("RPC:", rpcUrl);
  console.log("📝 Deploying from:", await wallet.getAddress());
  const balance = await provider.getBalance(await wallet.getAddress());
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

  const artifactPath = resolve("./artifacts/contracts/TrustlessVote.sol/TrustlessVote.json");
  if (!existsSync(artifactPath)) {
    throw new Error(`Artifact not found at ${artifactPath}. Run 'npx hardhat compile' first.`);
  }
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const { abi, bytecode } = artifact;

  console.log("⏳ Deploying contract...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n✅ TrustlessVote deployed successfully!");
  console.log("━".repeat(60));
  console.log("📋 Contract Address:", address);
  console.log("━".repeat(60));

  const envPath = ".env.docker";
  if (existsSync(envPath)) {
    let txt = readFileSync(envPath, "utf8");
    if (/^VITE_CONTRACT_ADDRESS=.*$/m.test(txt)) {
      txt = txt.replace(/^VITE_CONTRACT_ADDRESS=.*$/m, `VITE_CONTRACT_ADDRESS=${address}`);
    } else {
      txt += `\nVITE_CONTRACT_ADDRESS=${address}\n`;
    }
    writeFileSync(envPath, txt);
    console.log(`\n📝 Updated ${envPath} with VITE_CONTRACT_ADDRESS=${address}`);
  } else {
    console.log("\nℹ️ .env.docker not found. Please set VITE_CONTRACT_ADDRESS manually.");
  }
}

main().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});
