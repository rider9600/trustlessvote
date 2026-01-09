import { supabase } from '@/lib/supabase';
import {
  Election,
  ElectionPhase,
  ElectionWithPhases,
  AdminElectionStats,
} from '@/types/supabase';

/**
 * Elections Service
 */

// Create new election
export async function createElection(
  adminId: string,
  name: string,
  description: string | null,
  status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming'
): Promise<Election> {
  const { data, error } = await supabase
    .from('elections')
    .insert({
      admin_id: adminId,
      name,
      description,
      status,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all elections
export async function getAllElections(): Promise<Election[]> {
  const { data, error } = await supabase
    .from('elections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get elections by admin
export async function getElectionsByAdmin(adminId: string): Promise<Election[]> {
  const { data, error } = await supabase
    .from('elections')
    .select('*')
    .eq('admin_id', adminId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get elections by status
export async function getElectionsByStatus(
  status: 'upcoming' | 'ongoing' | 'completed',
  adminId?: string
): Promise<Election[]> {
  let query = supabase
    .from('elections')
    .select('*')
    .eq('status', status);

  if (adminId) {
    query = query.eq('admin_id', adminId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get election by ID
export async function getElectionById(electionId: string): Promise<Election | null> {
  const { data, error } = await supabase
    .from('elections')
    .select('*')
    .eq('id', electionId)
    .single();

  if (error) throw error;
  return data;
}

// Get election with phases
export async function getElectionWithPhases(electionId: string): Promise<ElectionWithPhases | null> {
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('*')
    .eq('id', electionId)
    .single();

  if (electionError) throw electionError;

  const { data: phases, error: phasesError } = await supabase
    .from('election_phases')
    .select('*')
    .eq('election_id', electionId)
    .order('start_time', { ascending: true });

  if (phasesError) throw phasesError;

  const currentPhase = phases?.find((p) => p.is_active);

  return {
    ...election,
    phases: phases || [],
    current_phase: currentPhase,
  };
}

// Update election
export async function updateElection(
  electionId: string,
  updates: Partial<Election>
): Promise<Election> {
  const { data, error } = await supabase
    .from('elections')
    .update(updates)
    .eq('id', electionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete election
export async function deleteElection(electionId: string): Promise<void> {
  const { error } = await supabase
    .from('elections')
    .delete()
    .eq('id', electionId);

  if (error) throw error;
}

/**
 * Election Phases Service
 */

// Create election phase
export async function createElectionPhase(
  electionId: string,
  phase: 'registration' | 'commit' | 'reveal' | 'results',
  startTime: string,
  endTime: string,
  isActive: boolean = false
): Promise<ElectionPhase> {
  const { data, error } = await supabase
    .from('election_phases')
    .insert({
      election_id: electionId,
      phase,
      start_time: startTime,
      end_time: endTime,
      is_active: isActive,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get phases for election
export async function getElectionPhases(electionId: string): Promise<ElectionPhase[]> {
  const { data, error } = await supabase
    .from('election_phases')
    .select('*')
    .eq('election_id', electionId)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Update phase
export async function updateElectionPhase(
  phaseId: string,
  updates: Partial<ElectionPhase>
): Promise<ElectionPhase> {
  const { data, error } = await supabase
    .from('election_phases')
    .update(updates)
    .eq('id', phaseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin Stats Service
 */

// Get admin stats
export async function getAdminStats(adminId: string): Promise<AdminElectionStats | null> {
  const { data, error } = await supabase
    .from('admin_election_stats')
    .select('*')
    .eq('admin_id', adminId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return data;
}

// Refresh admin stats (calculate from elections)
export async function refreshAdminStats(adminId: string): Promise<AdminElectionStats> {
  const elections = await getElectionsByAdmin(adminId);

  const stats = {
    upcoming_count: elections.filter((e) => e.status === 'upcoming').length,
    ongoing_count: elections.filter((e) => e.status === 'ongoing').length,
    completed_count: elections.filter((e) => e.status === 'completed').length,
  };

  const { data, error } = await supabase
    .from('admin_election_stats')
    .upsert({
      admin_id: adminId,
      ...stats,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
