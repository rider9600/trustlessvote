import { ethers, BrowserProvider, Contract, Signer, JsonRpcProvider } from 'ethers';
import { TRUSTLESS_VOTE_ABI, CONTRACT_ADDRESS, HARDHAT_CHAIN_ID, HARDHAT_NETWORK, RPC_URL } from './contracts/trustlessVote';

/**
 * Web3 Connection Manager
 * Handles MetaMask connection, network switching, and contract instances
 */

export class Web3Manager {
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private contract: Contract | null = null;
  private walletAddress: string | null = null;

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to MetaMask wallet
   * @returns Wallet address
   */
  async connectWallet(): Promise<string> {
    console.log('[Web3Manager] Starting wallet connection...');
    
    if (!this.isMetaMaskInstalled()) {
      console.error('[Web3Manager] MetaMask not installed');
      throw new Error('MetaMask is not installed. Please install MetaMask extension.');
    }

    console.log('[Web3Manager] MetaMask detected');

    try {
      // Request account access
      console.log('[Web3Manager] Requesting accounts...');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('[Web3Manager] Accounts received:', accounts);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.walletAddress = accounts[0];

      console.log('[Web3Manager] Wallet address:', this.walletAddress);

      // Check if on correct network
      await this.checkAndSwitchNetwork();

      // Initialize contract
      if (CONTRACT_ADDRESS) {
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, TRUSTLESS_VOTE_ABI, this.signer);
        console.log('[Web3Manager] Contract initialized at:', CONTRACT_ADDRESS);
      } else {
        console.warn('[Web3Manager] No contract address provided - skipping contract initialization');
      }

      return this.walletAddress;
    } catch (error: any) {
      console.error('[Web3Manager] Error connecting to MetaMask:', error);
      throw new Error(error.message || 'Failed to connect to MetaMask');
    }
  }

  /**
   * Check if connected to Hardhat network, switch if not
   */
  async checkAndSwitchNetwork(): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const network = await this.provider.getNetwork();
    const currentChainId = Number(network.chainId);

    console.log('[Web3Manager] Current chain ID:', currentChainId, 'Expected:', HARDHAT_CHAIN_ID);

    if (currentChainId !== HARDHAT_CHAIN_ID) {
      try {
        // Try to switch to Hardhat network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: HARDHAT_NETWORK.chainId }],
        });
        console.log('[Web3Manager] Switched to Hardhat network');
      } catch (switchError: any) {
        // If Hardhat network not added, add it
        if (switchError.code === 4902) {
          console.log('[Web3Manager] Adding Hardhat network to MetaMask...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [HARDHAT_NETWORK],
          });
          console.log('[Web3Manager] Hardhat network added successfully');
        } else {
          throw switchError;
        }
      }
    }
  }

  /**
   * Get current wallet address
   */
  getWalletAddress(): string | null {
    return this.walletAddress;
  }

  /**
   * Get contract instance
   */
  getContract(): Contract {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }
    return this.contract;
  }

  /**
   * Get provider
   */
  getProvider(): BrowserProvider {
    if (!this.provider) {
      throw new Error('Provider not initialized. Please connect wallet first.');
    }
    return this.provider;
  }

  /**
   * Get signer
   */
  getSigner(): Signer {
    if (!this.signer) {
      throw new Error('Signer not initialized. Please connect wallet first.');
    }
    return this.signer;
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.walletAddress = null;
  }

  /**
   * Listen to account changes
   */
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (this.isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  /**
   * Listen to network changes
   */
  onChainChanged(callback: (chainId: string) => void): void {
    if (this.isMetaMaskInstalled()) {
      window.ethereum.on('chainChanged', callback);
    }
  }
}

// Singleton instance
export const web3Manager = new Web3Manager();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
