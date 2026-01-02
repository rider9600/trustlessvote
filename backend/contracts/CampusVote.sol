// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustlessVote {
    enum Phase { Register, Commit, Reveal, End }
    Phase public currentPhase;

    address public admin;

    mapping(address => bool) public eligibleVoters;
    mapping(address => bytes32) public commitments;
    mapping(uint256 => uint256) public voteCount;

    constructor() {
        admin = msg.sender;
        currentPhase = Phase.Register;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier inPhase(Phase p) {
        require(currentPhase == p, "Wrong phase");
        _;
    }

    function addVoter(address voter) external onlyAdmin {
        eligibleVoters[voter] = true;
    }

    function nextPhase() external onlyAdmin {
        currentPhase = Phase(uint(currentPhase) + 1);
    }

    function commitVote(bytes32 commitment)
        external
        inPhase(Phase.Commit)
    {
        require(eligibleVoters[msg.sender], "Not eligible");
        require(commitments[msg.sender] == 0, "Already committed");

        commitments[msg.sender] = commitment;
    }

    function revealVote(uint256 choice, string calldata secret)
        external
        inPhase(Phase.Reveal)
    {
        bytes32 hash = keccak256(abi.encodePacked(choice, secret));
        require(commitments[msg.sender] == hash, "Invalid reveal");

        voteCount[choice]++;
    }
}
