import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, UserCheck, KeyRound } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const DEMO_EMAIL = 'voter@trustless.vote';
const DEMO_PASSWORD = 'c';

export default function LoginPage() {
  const navigate = useNavigate();
  const [voterEmail, setVoterEmail] = useState('');
  const [voterPassword, setVoterPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);


  const handleVoterLogin = () => {
    if (voterEmail === DEMO_EMAIL && voterPassword === DEMO_PASSWORD) {
      setError(null);
      navigate('/voter');
    } else {
      setError('Invalid voter credentials. Use voter@trustless.vote / password123 for the demo.');
    }
  };

  const handleAdminLogin = () => {
    // Simple validation (frontend only)
    if (adminEmail && adminPassword) {
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Please enter both email and password');
    }
  };

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin={false} minimalNav>
      <div className="min-h-[70vh] lg:min-h-[68vh] grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {/* Voter Side */}
        <section className="secure-zone p-6 md:p-8 flex flex-col justify-between">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
              <UserCheck className="w-4 h-4" />
              Voter Access
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Sign in as Voter
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                Use your registered email address and password to access the voter portal.
              </p>
            </div>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="voter-email">Email address</Label>
                <Input
                  id="voter-email"
                  type="email"
                  placeholder="you@example.com"
                  value={voterEmail}
                  onChange={(e) => setVoterEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voter-password">Password</Label>
                <Input
                  id="voter-password"
                  type="password"
                  placeholder="Enter your password"
                  value={voterPassword}
                  onChange={(e) => setVoterPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVoterLogin()}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <Button
                  variant="vote"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleVoterLogin}
                >
                  <Lock className="w-4 h-4" />
                  Sign in as Voter
                </Button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                By continuing, you confirm that you are an eligible voter in this election and agree to
                the official terms and privacy policy.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-6 border-t border-border pt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Voter login is secured using institutional-grade encryption.</span>
            <span className="hidden sm:inline">Do not share your credentials with anyone.</span>
          </div>
        </section>

        {/* Admin Side */}
        <section className="official-card p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium">
              <Shield className="w-4 h-4" />
              Admin Console
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Administrator Login
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                Access election controls, approve voters, and manage phases from a verified admin account.
              </p>
            </div>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="admin-id">Email Address</Label>
                <Input
                  id="admin-id"
                  placeholder="Enter admin's email address"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-pass">Password</Label>
                <Input
                  id="admin-pass"
                  type="password"
                  placeholder="Enter admin's password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  variant="official" 
                  size="lg" 
                  className="w-full"
                  onClick={handleAdminLogin}
                >
                  <KeyRound className="w-4 h-4" />
                  Sign in to Admin Dashboard
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Protected administrative environment</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span>On‑chain auditability</span>
              <span className="hidden md:inline">Role‑based access • Multi-factor ready</span>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
