// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TrustlessVote
 * @dev Multi-election commit-reveal voting system for campus elections
 */
contract TrustlessVote {
    enum Phase { Registration, Commit, Reveal, Results }
    
    struct Election {
        string electionId; // UUID from Supabase
        address admin;
        Phase currentPhase;
        uint256 totalVoters;
        uint256 totalCommitted;
        uint256 totalRevealed;
        bool exists;
    }
    
    // Election ID => Election data
    mapping(string => Election) public elections;
    
    // Election ID => Voter address => eligible
    mapping(string => mapping(address => bool)) public eligibleVoters;
    
    // Election ID => Voter address => commitment hash
    mapping(string => mapping(address => bytes32)) public commitments;
    
    // Election ID => Voter address => has revealed
    mapping(string => mapping(address => bool)) public hasRevealed;
    
    // Election ID => Candidate ID => vote count
    mapping(string => mapping(string => uint256)) public voteCounts;
    
    // Events
    event ElectionCreated(string indexed electionId, address indexed admin);
    event VoterAdded(string indexed electionId, address indexed voter);
    event PhaseChanged(string indexed electionId, Phase newPhase);
    event VoteCommitted(string indexed electionId, address indexed voter, bytes32 commitment);
    event VoteRevealed(string indexed electionId, address indexed voter, string candidateId);
    
    modifier onlyAdmin(string memory electionId) {
        require(elections[electionId].exists, "Election does not exist");
        require(elections[electionId].admin == msg.sender, "Not admin");
        _;
    }
    
    modifier inPhase(string memory electionId, Phase phase) {
        require(elections[electionId].exists, "Election does not exist");
        require(elections[electionId].currentPhase == phase, "Wrong phase");
        _;
    }
    
    modifier isEligible(string memory electionId) {
        require(eligibleVoters[electionId][msg.sender], "Not eligible voter");
        _;
    }
    
    /**
     * @dev Create a new election
     * @param electionId UUID from Supabase
     */
    function createElection(string memory electionId) external {
        require(!elections[electionId].exists, "Election already exists");
        
        elections[electionId] = Election({
            electionId: electionId,
            admin: msg.sender,
            currentPhase: Phase.Registration,
            totalVoters: 0,
            totalCommitted: 0,
            totalRevealed: 0,
            exists: true
        });
        
        emit ElectionCreated(electionId, msg.sender);
    }
    
    /**
     * @dev Add eligible voter to election
     * @param electionId Election UUID
     * @param voter Voter's wallet address
     */
    function addVoter(string memory electionId, address voter) 
        external 
        onlyAdmin(electionId) 
    {
        require(!eligibleVoters[electionId][voter], "Voter already added");
        
        eligibleVoters[electionId][voter] = true;
        elections[electionId].totalVoters++;
        
        emit VoterAdded(electionId, voter);
    }
    
    /**
     * @dev Add multiple voters at once (gas optimization)
     * @param electionId Election UUID
     * @param voters Array of voter addresses
     */
    function addVotersBatch(string memory electionId, address[] memory voters) 
        external 
        onlyAdmin(electionId) 
    {
        for (uint i = 0; i < voters.length; i++) {
            if (!eligibleVoters[electionId][voters[i]]) {
                eligibleVoters[electionId][voters[i]] = true;
                elections[electionId].totalVoters++;
                emit VoterAdded(electionId, voters[i]);
            }
        }
    }
    
    /**
     * @dev Change election phase
     * @param electionId Election UUID
     * @param newPhase New phase
     */
    function setPhase(string memory electionId, Phase newPhase) 
        external 
        onlyAdmin(electionId) 
    {
        elections[electionId].currentPhase = newPhase;
        emit PhaseChanged(electionId, newPhase);
    }
    
    /**
     * @dev Commit a vote (hashed)
     * @param electionId Election UUID
     * @param commitment Hash of (candidateId + secret)
     */
    function commitVote(string memory electionId, bytes32 commitment) 
        external 
        inPhase(electionId, Phase.Commit)
        isEligible(electionId)
    {
        require(commitments[electionId][msg.sender] == bytes32(0), "Already committed");
        require(commitment != bytes32(0), "Invalid commitment");
        
        commitments[electionId][msg.sender] = commitment;
        elections[electionId].totalCommitted++;
        
        emit VoteCommitted(electionId, msg.sender, commitment);
    }
    
    /**
     * @dev Reveal vote and increment candidate count
     * @param electionId Election UUID
     * @param candidateId Candidate UUID from Supabase
     * @param secret Secret used during commit
     */
    function revealVote(
        string memory electionId, 
        string memory candidateId, 
        string memory secret
    ) 
        external 
        inPhase(electionId, Phase.Reveal)
        isEligible(electionId)
    {
        require(commitments[electionId][msg.sender] != bytes32(0), "No commitment found");
        require(!hasRevealed[electionId][msg.sender], "Already revealed");
        
        // Verify commitment matches
        bytes32 expectedHash = keccak256(abi.encodePacked(candidateId, secret));
        require(commitments[electionId][msg.sender] == expectedHash, "Invalid reveal");
        
        // Mark as revealed and increment vote count
        hasRevealed[electionId][msg.sender] = true;
        voteCounts[electionId][candidateId]++;
        elections[electionId].totalRevealed++;
        
        emit VoteRevealed(electionId, msg.sender, candidateId);
    }
    
    /**
     * @dev Get vote count for a candidate
     * @param electionId Election UUID
     * @param candidateId Candidate UUID
     * @return Vote count
     */
    function getVoteCount(string memory electionId, string memory candidateId) 
        external 
        view 
        returns (uint256) 
    {
        return voteCounts[electionId][candidateId];
    }
    
    /**
     * @dev Get election stats
     * @param electionId Election UUID
     * @return admin Election admin address
     * @return phase Current election phase
     * @return totalVoters Total eligible voters
     * @return totalCommitted Total committed votes
     * @return totalRevealed Total revealed votes
     */
    function getElectionStats(string memory electionId) 
        external 
        view 
        returns (
            address admin,
            Phase phase,
            uint256 totalVoters,
            uint256 totalCommitted,
            uint256 totalRevealed
        ) 
    {
        Election memory election = elections[electionId];
        return (
            election.admin,
            election.currentPhase,
            election.totalVoters,
            election.totalCommitted,
            election.totalRevealed
        );
    }
    
    /**
     * @dev Check if voter has committed
     * @param electionId Election UUID
     * @param voter Voter address
     * @return true if committed
     */
    function hasCommitted(string memory electionId, address voter) 
        external 
        view 
        returns (bool) 
    {
        return commitments[electionId][voter] != bytes32(0);
    }
    
    /**
     * @dev Check if voter is eligible
     * @param electionId Election UUID
     * @param voter Voter address
     * @return true if eligible
     */
    function isVoterEligible(string memory electionId, address voter) 
        external 
        view 
        returns (bool) 
    {
        return eligibleVoters[electionId][voter];
    }
}
