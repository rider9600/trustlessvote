import { supabase } from '@/lib/supabase';
import {
  ElectionVoter,
  VoterWithProfile,
  Profile,
} from '@/types/supabase';

/**
 * Election Voters Service
 */

// Add voter to election
export async function addVoterToElection(
  electionId: string,
  voterId: string,
  isEligible: boolean = true
): Promise<ElectionVoter> {
  const { data, error } = await supabase
    .from('election_voters')
    .insert({
      election_id: electionId,
      voter_id: voterId,
      is_eligible: isEligible,
      has_committed: false,
      has_revealed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get voters for election
export async function getVotersByElection(electionId: string): Promise<ElectionVoter[]> {
  const { data, error } = await supabase
    .from('election_voters')
    .select('*')
    .eq('election_id', electionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Get voter status in election
export async function getVoterStatus(
  electionId: string,
  voterId: string
): Promise<ElectionVoter | null> {
  const { data, error } = await supabase
    .from('election_voters')
    .select('*')
    .eq('election_id', electionId)
    .eq('voter_id', voterId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return data;
}

// Get elections for voter
export async function getElectionsForVoter(voterId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('election_voters')
    .select('election_id')
    .eq('voter_id', voterId);

  if (error) throw error;
  return data?.map((ev) => ev.election_id).filter((id): id is string => id !== null) || [];
}

// Update voter status (commit/reveal)
export async function updateVoterStatus(
  electionVoterId: string,
  updates: {
    has_committed?: boolean;
    has_revealed?: boolean;
    is_eligible?: boolean;
  }
): Promise<ElectionVoter> {
  const { data, error } = await supabase
    .from('election_voters')
    .update(updates)
    .eq('id', electionVoterId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Remove voter from election
export async function removeVoterFromElection(
  electionId: string,
  voterId: string
): Promise<void> {
  const { error } = await supabase
    .from('election_voters')
    .delete()
    .eq('election_id', electionId)
    .eq('voter_id', voterId);

  if (error) throw error;
}

// Get voters with profiles for election
export async function getVotersWithProfiles(
  electionId: string
): Promise<VoterWithProfile[]> {
  const electionVoters = await getVotersByElection(electionId);

  const votersWithProfiles = await Promise.all(
    electionVoters.map(async (ev) => {
      if (!ev.voter_id) return { ...ev };

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ev.voter_id)
        .single();

      return {
        ...ev,
        profile: profile || undefined,
      };
    })
  );

  return votersWithProfiles;
}

// Get voter count stats for election
export async function getVoterStats(electionId: string) {
  const voters = await getVotersByElection(electionId);

  return {
    total: voters.length,
    eligible: voters.filter((v) => v.is_eligible).length,
    committed: voters.filter((v) => v.has_committed).length,
    revealed: voters.filter((v) => v.has_revealed).length,
  };
}

// Bulk add voters to election
export async function bulkAddVotersToElection(
  electionId: string,
  voterIds: string[]
): Promise<ElectionVoter[]> {
  const inserts = voterIds.map((voterId) => ({
    election_id: electionId,
    voter_id: voterId,
    is_eligible: true,
    has_committed: false,
    has_revealed: false,
  }));

  const { data, error } = await supabase
    .from('election_voters')
    .insert(inserts)
    .select();

  if (error) throw error;
  return data || [];
}
