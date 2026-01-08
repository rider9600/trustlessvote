export type ElectionPhase = 
  | 'registration'
  | 'approval'
  | 'commit'
  | 'reveal'
  | 'results';

export type VoterStatus = 
  | 'unregistered'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'committed'
  | 'revealed';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  photo: string;
  bio: string;
  manifesto: {
    vision: string;
    policies: string[];
    promises: string[];
  };
  votes?: number;
}

export interface Voter {
  id: string;
  walletAddress: string;
  name: string;
  registeredAt: string;
  status: VoterStatus;
  approvedAt?: string;
  committedAt?: string;
  revealedAt?: string;
}

export interface ElectionState {
  currentPhase: ElectionPhase;
  electionName: string;
  startDate: string;
  endDate: string;
  totalRegistered: number;
  totalApproved: number;
  totalCommitted: number;
  totalRevealed: number;
}

export interface PhaseInfo {
  id: ElectionPhase;
  label: string;
  description: string;
  status: 'upcoming' | 'active' | 'completed';
}
