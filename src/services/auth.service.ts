import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/supabase';

/**
 * Authentication Service
 */

// Sign up new user (admin or voter)
export async function signUp(email: string, password: string, fullName: string, role: 'admin' | 'voter') {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: fullName,
      email,
      role,
    });

  if (profileError) throw profileError;

  return authData.user;
}

// Sign in
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get current user profile
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

// Get profile by ID
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Update profile
export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Search profiles by name or email, optionally filtered by role
export async function searchProfiles(query: string, role?: 'admin' | 'voter'): Promise<Profile[]> {
  const term = query.trim();
  if (!term) return [];

  let request = supabase
    .from('profiles')
    .select('*')
    .ilike('full_name', `%${term}%`)
    .limit(5);

  if (role) {
    request = request.eq('role', role);
  }

  const { data, error } = await request;
  if (error) throw error;
  return data || [];
}
