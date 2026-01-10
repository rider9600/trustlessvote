import { ethers } from 'ethers';
import { supabase } from '@/lib/supabase';

/**
 * Deploy a new TrustlessVote contract for an election
 * @param electionId Election UUID
 * @returns Contract address
 */
export async function deployContractForElection(electionId: string): Promise<string> {
  const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://localhost:8545';
  
  // Admin account (Hardhat #0) deploys contracts
  const DEPLOYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

    // In production, you'd load the compiled contract artifact
    // For now, assuming contract is already deployed and we just use a reference
    // In real scenario: deploy new instance per election
    
    console.log('[contract-deployment] Deploying contract for election:', electionId);
    
    // TODO: Actual deployment logic here
    // const factory = new ethers.ContractFactory(ABI, BYTECODE, deployer);
    // const contract = await factory.deploy();
    // await contract.waitForDeployment();
    // const contractAddress = await contract.getAddress();

    // For now, using the main deployed contract (you can deploy multiple in production)
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

    if (!contractAddress) {
      throw new Error('No contract address configured');
    }

    // Store in database
    const { error } = await supabase
      .from('election_blockchain_map')
      .insert({
        election_id: electionId,
        contract_address: contractAddress,
        chain_name: 'Hardhat Local'
      });

    if (error) throw error;

    console.log('[contract-deployment] Contract mapped:', contractAddress);
    return contractAddress;
  } catch (error: any) {
    console.error('[contract-deployment] Error:', error);
    throw new Error(error.message || 'Failed to deploy contract');
  }
}

/**
 * Get contract address for an election
 */
export async function getContractForElection(electionId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('election_blockchain_map')
    .select('contract_address')
    .eq('election_id', electionId)
    .single();

  if (error) {
    console.error('[contract-deployment] Error fetching contract:', error);
    return null;
  }

  return data?.contract_address || null;
}
