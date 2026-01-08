// Extended types matching Supabase schema
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'voter';
  wallet_address?: string; // Optional for frontend display
  created_at: string;
}

export interface Election {
  id: string;
  admin_id: string | null;
  name: string;
  description: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  created_at: string;
}

export interface ElectionPhase {
  id: string;
  election_id: string | null;
  phase: 'registration' | 'commit' | 'reveal' | 'results';
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface Candidate {
  id: string;
  election_id: string | null;
  name: string;
  party_name: string | null;
  symbol: string | null;
  logo_url: string | null;
  photo_url: string | null;
  biography: string | null;
  created_at: string;
}

export interface CandidateManifesto {
  id: string;
  candidate_id: string | null;
  vision_statement: string | null;
  policy_points: string | null; // JSON string array
  campaign_promises: string | null; // JSON string array
  created_at: string;
}

export interface ElectionVoter {
  id: string;
  election_id: string | null;
  voter_id: string | null;
  is_eligible: boolean;
  has_committed: boolean;
  has_revealed: boolean;
  created_at: string;
}

export interface ElectionBlockchainMap {
  election_id: string;
  contract_address: string;
  chain_name: string | null;
  created_at: string;
}

export interface AdminElectionStats {
  admin_id: string;
  upcoming_count: number;
  ongoing_count: number;
  completed_count: number;
  updated_at: string;
}

// Composite types for frontend display
export interface ElectionWithPhases extends Election {
  phases: ElectionPhase[];
  current_phase?: ElectionPhase;
  candidates?: Candidate[];
  voters?: ElectionVoter[];
}

export interface CandidateWithManifesto extends Candidate {
  manifesto?: CandidateManifesto;
}

export interface VoterWithProfile extends ElectionVoter {
  profile?: Profile;
}
