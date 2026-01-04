const hre = require('hardhat');

async function main() {
  const [admin, voter] = await hre.ethers.getSigners();

  const TrustlessVote = await hre.ethers.getContractFactory('TrustlessVote');
  const contract = await TrustlessVote.deploy();
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log('Deployed TrustlessVote at', addr);

  // Register voter
  const voterAddr = await voter.getAddress();
  console.log('Admin adding voter', voterAddr);
  await (await contract.addVoter(voterAddr)).wait();

  // Move to Commit phase
  await (await contract.nextPhase()).wait();
  console.log('Moved to Commit phase');

  // Voter commits choice=1 with secret 's3cr3t'
  const choice = 1;
  const secret = 's3cr3t';

  const abi = hre.ethers.AbiCoder.defaultAbiCoder();
  const choiceEncoded = abi.encode(['uint256'], [choice]);
  const secretBytes = hre.ethers.toUtf8Bytes(secret);
  const packed = hre.ethers.concat([choiceEncoded, secretBytes]);
  const commitment = hre.ethers.keccak256(packed);

  console.log('Voter committing:', commitment);
  await (await contract.connect(voter).commitVote(commitment)).wait();
  console.log('Commit done');

  // Move to Reveal phase
  await (await contract.nextPhase()).wait();
  console.log('Moved to Reveal phase');

  // Voter reveals
  await (await contract.connect(voter).revealVote(choice, secret)).wait();
  console.log('Reveal done');

  // Read tally
  const tally = await contract.voteCount(choice);
  console.log('Tally for choice', choice, ':', tally.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
