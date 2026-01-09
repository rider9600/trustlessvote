import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Shield, KeyRound } from 'lucide-react';
import { signUp } from '@/services/auth.service';

export default function SignUpPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'voter' | 'admin'>('voter');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, fullName, role);
      toast.success('Account created! You can now sign in.');
      navigate('/login');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin={role === 'admin'} minimalNav>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-xl space-y-8 animate-fade-up">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <UserPlus className="w-4 h-4" />
              Create an account
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sign up</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Create a new voter or admin account to access trustlessVote.
            </p>
          </div>

          {/* Form */}
          <div className="official-card p-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input
                  id="full-name"
                  placeholder="Your legal name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-2">
              <Label>Account type</Label>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setRole('voter')}
                  className={`flex flex-col gap-1 rounded-lg border px-3 py-2 text-left transition-colors ${
                    role === 'voter'
                      ? 'border-accent bg-accent/10 text-foreground'
                      : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">Voter</span>
                  <span className="text-xs">
                    Recommended. Participate in assigned elections.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col gap-1 rounded-lg border px-3 py-2 text-left transition-colors ${
                    role === 'admin'
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">Admin</span>
                  <span className="text-xs">
                    Manage elections and voters.
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" />
                In real deployments, admin accounts are usually provisioned by the institution.
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <Button
                variant="official"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                <KeyRound className="w-4 h-4" />
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Already have an account?</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
