import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { demoVoter } from '@/data/mockData';
import { ArrowLeft, Save, Wallet, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function VoterProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState(demoVoter.name);
  const [email, setEmail] = useState(demoVoter.email);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSave = () => {
    // In this demo we just show a toast; in a real app this would persist to backend.
    toast.success('Profile preferences saved for this session.');
  };

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
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            <p className="mt-1 text-[11px] font-mono text-muted-foreground truncate flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              {demoVoter.walletAddress}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet">Linked wallet (read-only)</Label>
            <Input
              id="wallet"
              value={demoVoter.walletAddress}
              readOnly
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Your wallet is used to sign commitments and verify your vote on-chain. To change it,
              contact election administrators in a real deployment.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="official" size="lg" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
