import { supabase } from '@/lib/supabase';
import {
  Candidate,
  CandidateManifesto,
  CandidateWithManifesto,
} from '@/types/supabase';

/**
 * Candidates Service
 */

// Create candidate
export async function createCandidate(
  electionId: string,
  name: string,
  partyName: string | null,
  symbol: string | null,
  logoUrl: string | null,
  photoUrl: string | null,
  biography: string | null
): Promise<Candidate> {
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      election_id: electionId,
      name,
      party_name: partyName,
      symbol,
      logo_url: logoUrl,
      photo_url: photoUrl,
      biography,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get candidates by election
export async function getCandidatesByElection(electionId: string): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('election_id', electionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Get candidate by ID
export async function getCandidateById(candidateId: string): Promise<Candidate | null> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single();

  if (error) throw error;
  return data;
}

// Update candidate
export async function updateCandidate(
  candidateId: string,
  updates: Partial<Candidate>
): Promise<Candidate> {
  const { data, error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', candidateId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete candidate
export async function deleteCandidate(candidateId: string): Promise<void> {
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId);

  if (error) throw error;
}

/**
 * Candidate Manifestos Service
 */

// Create manifesto
export async function createManifesto(
  candidateId: string,
  visionStatement: string | null,
  policyPoints: string[] | null, // Will be stored as JSON string
  campaignPromises: string[] | null // Will be stored as JSON string
): Promise<CandidateManifesto> {
  const { data, error } = await supabase
    .from('candidate_manifestos')
    .insert({
      candidate_id: candidateId,
      vision_statement: visionStatement,
      policy_points: policyPoints ? JSON.stringify(policyPoints) : null,
      campaign_promises: campaignPromises ? JSON.stringify(campaignPromises) : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get manifesto by candidate
export async function getManifestoByCandidate(
  candidateId: string
): Promise<CandidateManifesto | null> {
  const { data, error } = await supabase
    .from('candidate_manifestos')
    .select('*')
    .eq('candidate_id', candidateId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return data;
}

// Update manifesto
export async function updateManifesto(
  manifestoId: string,
  updates: Partial<CandidateManifesto>
): Promise<CandidateManifesto> {
  const { data, error } = await supabase
    .from('candidate_manifestos')
    .update(updates)
    .eq('id', manifestoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get candidates with manifestos for election
export async function getCandidatesWithManifestos(
  electionId: string
): Promise<CandidateWithManifesto[]> {
  const candidates = await getCandidatesByElection(electionId);

  const candidatesWithManifestos = await Promise.all(
    candidates.map(async (candidate) => {
      const manifesto = await getManifestoByCandidate(candidate.id);
      return {
        ...candidate,
        manifesto: manifesto || undefined,
      };
    })
  );

  return candidatesWithManifestos;
}
