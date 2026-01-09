import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Wallet, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getCurrentProfile, updateProfile } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/supabase';

export default function VoterProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const current = await getCurrentProfile();

        // Allow both voters and admins to manage their profile from the voter portal
        if (!current || (current.role !== 'voter' && current.role !== 'admin')) {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        setProfile(current);
        setName(current.full_name);
      } catch (error: any) {
        console.error('Error loading voter profile:', error);
        toast.error('Failed to load profile');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const initials = (name || profile?.full_name || 'V')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    if (!profile) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Full name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      // Check uniqueness of full_name across profiles (excluding current user)
      const { data: existing, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', trimmedName)
        .neq('id', profile.id)
        .limit(1);

      if (error) throw error;

      if (existing && existing.length > 0) {
        toast.error('This full name is already in use. Please choose a different name.');
        setIsSaving(false);
        return;
      }

      const updated = await updateProfile(profile.id, { full_name: trimmedName });
      setProfile(updated);
      setName(updated.full_name);
      toast.success('Profile updated successfully.');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <Layout showStepper={false} currentPhase="registration" isAdmin={false}>
        <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin={false}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <section className="flex items-center gap-3 animate-fade-up">
          <Button variant="ghost" size="icon" onClick={() => navigate('/voter')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Manage Voter Profile</h1>
            <p className="text-sm text-muted-foreground">
              Update your contact details and review the wallet linked to your verified voter identity.
            </p>
          </div>
        </section>

        {/* Profile summary */}
        <section className="official-card p-5 flex items-center gap-4 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <Avatar className="h-12 w-12">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            <p className="mt-1 text-[11px] font-mono text-muted-foreground truncate flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              {profile.wallet_address || 'Not linked'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-success" />
            Verified voter wallet
          </div>
        </section>

        {/* Editable form */}
        <section className="official-card p-6 space-y-4 animate-fade-up" style={{ animationDelay: '140ms' }}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet">Linked wallet (read-only)</Label>
            <Input
              id="wallet"
              value={profile.wallet_address || 'Not linked yet'}
              readOnly
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Your wallet is used to sign commitments and verify your vote on-chain. To change it,
              contact election administrators in a real deployment.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="official" size="lg" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
