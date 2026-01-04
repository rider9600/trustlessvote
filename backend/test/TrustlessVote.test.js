const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrustlessVote", function () {
  let TrustlessVote, tv, owner, voter1, voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    TrustlessVote = await ethers.getContractFactory("TrustlessVote");
    tv = await TrustlessVote.connect(owner).deploy();
    await tv.deployed();
  });

  it("allows admin to add voters and complete commit->reveal flow", async function () {
    await tv.addVoter(voter1.address);
    await tv.addVoter(voter2.address);

    await tv.nextPhase(); // move to Commit

    const choice1 = 1;
    const secret1 = "s1";
    const commit1 = ethers.utils.solidityKeccak256(["uint256", "string"], [choice1, secret1]);
    await tv.connect(voter1).commitVote(commit1);

    const choice2 = 2;
    const secret2 = "s2";
    const commit2 = ethers.utils.solidityKeccak256(["uint256", "string"], [choice2, secret2]);
    await tv.connect(voter2).commitVote(commit2);

    await tv.nextPhase(); // move to Reveal

    await tv.connect(voter1).revealVote(choice1, secret1);
    await tv.connect(voter2).revealVote(choice2, secret2);

    expect(await tv.voteCount(choice1)).to.equal(1);
    expect(await tv.voteCount(choice2)).to.equal(1);
  });

  it("rejects commits from unregistered voters", async function () {
    await tv.nextPhase(); // Commit
    const commit = ethers.utils.solidityKeccak256(["uint256", "string"], [1, "x"]);
    await expect(tv.connect(voter1).commitVote(commit)).to.be.revertedWith("Not eligible");
  });

  it("rejects invalid reveal", async function () {
    await tv.addVoter(voter1.address);
    await tv.nextPhase(); // Commit
    const commit = ethers.utils.solidityKeccak256(["uint256", "string"], [1, "s"]);
    await tv.connect(voter1).commitVote(commit);

    await tv.nextPhase(); // Reveal
    await expect(tv.connect(voter1).revealVote(1, "wrong")).to.be.revertedWith("Invalid reveal");
  });
});
