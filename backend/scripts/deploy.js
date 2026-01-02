const { ethers } = require("hardhat");

async function main() {
	const TrustlessVote = await ethers.getContractFactory("TrustlessVote");
	const contract = await TrustlessVote.deploy();
	await contract.waitForDeployment();
	const address = await contract.getAddress();
	console.log("TrustlessVote deployed to:", address);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
