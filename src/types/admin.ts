import { Candidate, ElectionPhase, Voter } from './election';

export interface ElectionTimeframe {
  commitPhaseStart: string;
  commitPhaseEnd: string;
  revealPhaseStart: string;
  revealPhaseEnd: string;
}

export interface ElectionConfig {
  id: string;
  name: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
  createdBy: string;
  timeframe: ElectionTimeframe;
  voters: Voter[];
  candidates: Candidate[];
  currentPhase: ElectionPhase;
  totalVotes?: number;
  winnerId?: string;
}

export interface CreateElectionForm {
  name: string;
  description: string;
  commitPhaseStart: string;
  commitPhaseEnd: string;
  revealPhaseStart: string;
  revealPhaseEnd: string;
}

export interface AddVoterForm {
  name: string;
  email: string;
  walletAddress: string;
}

export interface AddCandidateForm {
  name: string;
  party: string;
  symbol: string;
  partyLogo: string;
  bio: string;
  vision: string;
  policies: string[];
  promises: string[];
}
