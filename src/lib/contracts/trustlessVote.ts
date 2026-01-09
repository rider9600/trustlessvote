import { ethers } from 'ethers';

// Contract ABI (Application Binary Interface)
// This defines the functions available in the smart contract
export const TRUSTLESS_VOTE_ABI = [
  "event ElectionCreated(string indexed electionId, address indexed admin)",
  "event VoterAdded(string indexed electionId, address indexed voter)",
  "event PhaseChanged(string indexed electionId, uint8 newPhase)",
  "event VoteCommitted(string indexed electionId, address indexed voter, bytes32 commitment)",
  "event VoteRevealed(string indexed electionId, address indexed voter, string candidateId)",
  
  "function createElection(string electionId) external",
  "function addVoter(string electionId, address voter) external",
  "function addVotersBatch(string electionId, address[] voters) external",
  "function setPhase(string electionId, uint8 newPhase) external",
  "function commitVote(string electionId, bytes32 commitment) external",
  "function revealVote(string electionId, string candidateId, string secret) external",
  "function getVoteCount(string electionId, string candidateId) external view returns (uint256)",
  "function getElectionStats(string electionId) external view returns (address admin, uint8 phase, uint256 totalVoters, uint256 totalCommitted, uint256 totalRevealed)",
  "function hasCommitted(string electionId, address voter) external view returns (bool)",
  "function isVoterEligible(string electionId, address voter) external view returns (bool)",
  "function elections(string) external view returns (string electionId, address admin, uint8 currentPhase, uint256 totalVoters, uint256 totalCommitted, uint256 totalRevealed, bool exists)",
  "function eligibleVoters(string, address) external view returns (bool)",
  "function commitments(string, address) external view returns (bytes32)",
  "function hasRevealed(string, address) external view returns (bool)",
  "function voteCounts(string, string) external view returns (uint256)"
];

// Contract address - will be set after deployment
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

// RPC URL for blockchain node
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://98.70.98.222:8545';

// Hardhat Network Configuration (Azure VM)
export const HARDHAT_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID) || 31337;
export const HARDHAT_CHAIN_ID_HEX = '0x7a69'; // 31337 in hex

export const HARDHAT_NETWORK = {
  chainId: HARDHAT_CHAIN_ID_HEX,
  chainName: 'Hardhat Network',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: [],
};

// Legacy Sepolia config (kept for reference)
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// Election phases (must match Solidity enum)
export enum Phase {
  Registration = 0,
  Commit = 1,
  Reveal = 2,
  Results = 3,
}

export const PHASE_NAMES: Record<Phase, string> = {
  [Phase.Registration]: 'Registration',
  [Phase.Commit]: 'Commit',
  [Phase.Reveal]: 'Reveal',
  [Phase.Results]: 'Results',
};
