import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/supabase';

/**
 * Authentication Service
 */

// Sign up new user (admin or voter) using Supabase Auth + profiles row
export async function signUp(email: string, password: string, fullName: string, role: 'admin' | 'voter') {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw signUpError;

  const user = signUpData.user;
  if (!user) throw new Error('Sign up failed: user missing');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    full_name: fullName,
    email,
    role,
  });
  if (profileError) throw profileError;

  return { id: user.id, email, role } as any;
}

// Sign in
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error('Login failed');

  // Try to load role from profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { user: { id: user.id, email: user.email, role: (profile as any)?.role } } as any;
}

// Sign out
export async function signOut() {
  await supabase.auth.signOut();
}

// Get current user
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null as any;
  return { id: user.id, email: user.email } as any;
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
  return data as Profile;
}

// Get profile by ID
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
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
  return data as Profile;
}

// Search profiles by name or email, optionally filtered by role
export async function searchProfiles(query: string, role?: 'admin' | 'voter'): Promise<Profile[]> {
  const term = query.trim();
  if (!term) return [];

  let builder = supabase
    .from('profiles')
    .select('*')
    .ilike('full_name', `%${term}%`)
    .order('created_at', { ascending: false })
    .limit(5);

  if (role) {
    builder = builder.eq('role', role);
  }

  const { data, error } = await builder;
  if (error) throw error;
  return (data || []) as Profile[];
}
