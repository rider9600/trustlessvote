import { ethers } from 'ethers';
import { web3Manager } from '@/lib/web3';
import { Phase } from '@/lib/contracts/trustlessVote';

/**
 * Blockchain Service
 * High-level functions for interacting with TrustlessVote smart contract
 */

/**
 * Connect MetaMask wallet
 * @returns Wallet address
 */
export async function connectMetaMask(): Promise<string> {
  return await web3Manager.connectWallet();
}

/**
 * Get current wallet address
 */
export function getWalletAddress(): string | null {
  return web3Manager.getWalletAddress();
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
  web3Manager.disconnect();
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  return web3Manager.getWalletAddress() !== null;
}

/**
 * Create a new election on blockchain
 * @param electionId UUID from Supabase
 */
export async function createElectionOnChain(electionId: string): Promise<string> {
  const contract = web3Manager.getContract();
  
  try {
    const tx = await contract.createElection(electionId);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error: any) {
    console.error('Error creating election on blockchain:', error);
    throw new Error(error.reason || error.message || 'Failed to create election');
  }
}

/**
 * Add voter to election on blockchain
 * @param electionId Election UUID
 * @param voterAddress Voter's wallet address
 */
export async function addVoterOnChain(
  electionId: string,
  voterAddress: string
): Promise<string> {
  const contract = web3Manager.getContract();
  
  try {
    const tx = await contract.addVoter(electionId, voterAddress);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error: any) {
    console.error('Error adding voter on blockchain:', error);
    throw new Error(error.reason || error.message || 'Failed to add voter');
  }
}

/**
 * Add multiple voters at once (batch operation)
 * @param electionId Election UUID
 * @param voterAddresses Array of voter wallet addresses
 */
export async function addVotersBatchOnChain(
  electionId: string,
  voterAddresses: string[]
): Promise<string> {
  const contract = web3Manager.getContract();
  
  try {
    const tx = await contract.addVotersBatch(electionId, voterAddresses);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error: any) {
    console.error('Error adding voters batch on blockchain:', error);
    throw new Error(error.reason || error.message || 'Failed to add voters');
  }
}

/**
 * Set election phase on blockchain
 * @param electionId Election UUID
 * @param phase New phase (0=Registration, 1=Commit, 2=Reveal, 3=Results)
 */
export async function setPhaseOnChain(
  electionId: string,
  phase: Phase
): Promise<string> {
  const contract = web3Manager.getContract();
  
  try {
    const tx = await contract.setPhase(electionId, phase);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error: any) {
    console.error('Error setting phase on blockchain:', error);
    throw new Error(error.reason || error.message || 'Failed to set phase');
  }
}

/**
 * Generate commitment hash for voting
 * @param candidateId Candidate UUID from Supabase
 * @param secret User's secret key
 * @returns Commitment hash
 */
export function generateCommitmentHash(candidateId: string, secret: string): string {
  // Hash = keccak256(candidateId + secret)
  const packed = ethers.solidityPacked(['string', 'string'], [candidateId, secret]);
  const hash = ethers.keccak256(packed);
  return hash;
}

/**
 * Commit a vote on blockchain
 * @param electionId Election UUID
 * @param candidateId Candidate UUID
 * @param secret Voter's secret key
 * @returns Transaction hash
 */
export async function commitVoteOnChain(
  electionId: string,
  candidateId: string,
  secret: string
): Promise<string> {
  try {
    const contract = web3Manager.getContract();
    
    // Generate commitment hash
    const commitmentHash = generateCommitmentHash(candidateId, secret);
    
    // Submit to blockchain
    const tx = await contract.commitVote(electionId, commitmentHash);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error committing vote on blockchain:', error);
    
    // Check if contract not initialized
    if (error.message && error.message.includes('Contract not initialized')) {
      throw new Error('Smart contract not deployed. Please deploy the TrustlessVote contract to Sepolia testnet first. See DEPLOYMENT_GUIDE.md for instructions.');
    }
    
    // Provide user-friendly error messages
    if (error.reason) {
      if (error.reason.includes('Wrong phase')) {
        throw new Error('Cannot commit vote: Election is not in Commit phase');
      } else if (error.reason.includes('Not eligible')) {
        throw new Error('You are not eligible to vote in this election');
      } else if (error.reason.includes('Already committed')) {
        throw new Error('You have already committed your vote');
      }
    }
    
    throw new Error(error.reason || error.message || 'Failed to commit vote');
  }
}

/**
 * Reveal a vote on blockchain
 * @param electionId Election UUID
 * @param candidateId Candidate UUID (same as used in commit)
 * @param secret Voter's secret key (same as used in commit)
 * @returns Transaction hash
 */
export async function revealVoteOnChain(
  electionId: string,
  candidateId: string,
  secret: string
): Promise<string> {
  try {
    const contract = web3Manager.getContract();
    
    const tx = await contract.revealVote(electionId, candidateId, secret);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error revealing vote on blockchain:', error);
    
    // Check if contract not initialized
    if (error.message && error.message.includes('Contract not initialized')) {
      throw new Error('Smart contract not deployed. Please deploy the TrustlessVote contract to Sepolia testnet first. See DEPLOYMENT_GUIDE.md for instructions.');
    }
    
    // Provide user-friendly error messages
    if (error.reason) {
      if (error.reason.includes('Wrong phase')) {
        throw new Error('Cannot reveal vote: Election is not in Reveal phase');
      } else if (error.reason.includes('No commitment')) {
        throw new Error('You have not committed a vote yet');
      } else if (error.reason.includes('Already revealed')) {
        throw new Error('You have already revealed your vote');
      } else if (error.reason.includes('Invalid reveal')) {
        throw new Error('Invalid candidate or secret. Must match your commitment.');
      }
    }
    
    throw new Error(error.reason || error.message || 'Failed to reveal vote');
  }
}

/**
 * Get vote count for a candidate from blockchain
 * @param electionId Election UUID
 * @param candidateId Candidate UUID
 * @returns Vote count
 */
export async function getVoteCountFromChain(
  electionId: string,
  candidateId: string
): Promise<number> {
  const contract = web3Manager.getContract();
  
  try {
    const count = await contract.getVoteCount(electionId, candidateId);
    return Number(count);
  } catch (error: any) {
    console.error('Error getting vote count from blockchain:', error);
    throw new Error(error.message || 'Failed to get vote count');
  }
}

/**
 * Get election stats from blockchain
 * @param electionId Election UUID
 * @returns Election statistics
 */
export async function getElectionStatsFromChain(electionId: string): Promise<{
  admin: string;
  phase: Phase;
  totalVoters: number;
  totalCommitted: number;
  totalRevealed: number;
}> {
  const contract = web3Manager.getContract();
  
  try {
    const stats = await contract.getElectionStats(electionId);
    return {
      admin: stats[0],
      phase: Number(stats[1]) as Phase,
      totalVoters: Number(stats[2]),
      totalCommitted: Number(stats[3]),
      totalRevealed: Number(stats[4]),
    };
  } catch (error: any) {
    console.error('Error getting election stats from blockchain:', error);
    throw new Error(error.message || 'Failed to get election stats');
  }
}

/**
 * Check if voter has committed
 * @param electionId Election UUID
 * @param voterAddress Voter's wallet address
 * @returns true if committed
 */
export async function hasCommittedOnChain(
  electionId: string,
  voterAddress: string
): Promise<boolean> {
  const contract = web3Manager.getContract();
  
  try {
    return await contract.hasCommitted(electionId, voterAddress);
  } catch (error: any) {
    console.error('Error checking commit status:', error);
    return false;
  }
}

/**
 * Check if voter is eligible
 * @param electionId Election UUID
 * @param voterAddress Voter's wallet address
 * @returns true if eligible
 */
export async function isVoterEligibleOnChain(
  electionId: string,
  voterAddress: string
): Promise<boolean> {
  const contract = web3Manager.getContract();
  
  try {
    return await contract.isVoterEligible(electionId, voterAddress);
  } catch (error: any) {
    console.error('Error checking eligibility:', error);
    return false;
  }
}

/**
 * Get all vote counts for candidates in an election
 * @param electionId Election UUID
 * @param candidateIds Array of candidate UUIDs
 * @returns Map of candidateId => vote count
 */
export async function getAllVoteCountsFromChain(
  electionId: string,
  candidateIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  
  for (const candidateId of candidateIds) {
    try {
      const count = await getVoteCountFromChain(electionId, candidateId);
      counts.set(candidateId, count);
    } catch (error) {
      console.error(`Error getting count for candidate ${candidateId}:`, error);
      counts.set(candidateId, 0);
    }
  }
  
  return counts;
}
