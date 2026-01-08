import { useState, useEffect } from 'react';
import { CalendarClock, Clock, History, User, Wallet } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentProfile } from '@/services/auth.service';
import { getElectionsForVoter } from '@/services/voters.service';
import { getElectionWithPhases } from '@/services/elections.service';
import { Profile, ElectionWithPhases } from '@/types/supabase';

type ElectionPhase = 'registration' | 'commit' | 'reveal' | 'results';

const phaseLabel: Record<ElectionPhase, string> = {
  registration: 'Registration',
  commit: 'Commit Vote',
  reveal: 'Reveal Vote',
  results: 'Results',
};

const statusTitle: Record<string, string> = {
  upcoming: 'Upcoming Elections',
  ongoing: 'Ongoing Elections',
  completed: 'Past Elections',
};

const statusDescription: Record<string, string> = {
  upcoming: 'Elections you can prepare for in advance.',
  ongoing: 'Active elections where you can participate now.',
  completed: 'Completed elections with final, verifiable results.',
};

function formatRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const startDate = start.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const endDate = end.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (sameDay) {
    const startTime = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${startDate}, ${startTime} – ${endTime}`;
  }

  return `${startDate} – ${endDate}`;
}

function ElectionSection({ 
  status, 
  elections 
}: { 
  status: 'upcoming' | 'ongoing' | 'completed';
  elections: ElectionWithPhases[];
}) {
  if (!elections.length) return null;

  return (
    <section className="space-y-4 animate-fade-up">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {status === 'upcoming' && <CalendarClock className="w-4 h-4 text-primary" />}
          {status === 'ongoing' && <Clock className="w-4 h-4 text-accent" />}
          {status === 'completed' && <History className="w-4 h-4 text-muted-foreground" />}
          {statusTitle[status]}
        </h2>
        <p className="text-sm text-muted-foreground">{statusDescription[status]}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {elections.map((election) => {
          const currentPhase = election.current_phase;
          const phaseStart = currentPhase?.start_time || '';
          const phaseEnd = currentPhase?.end_time || '';

          return (
            <Link
              key={election.id}
              to={`/voter/election/${election.id}`}
              className="official-card p-4 flex flex-col justify-between hover-lift"
            >
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {election.name}
                </p>
                <h3 className="text-base font-semibold text-foreground">
                  {election.description || 'No description'}
                </h3>

                {currentPhase && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-phase-active" />
                    <span className="uppercase tracking-wide text-muted-foreground">Current Phase</span>
                    <span className="text-foreground">{phaseLabel[currentPhase.phase]}</span>
                  </div>
                )}

                {phaseStart && phaseEnd && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="w-4 h-4" />
                    <span>Phase window: {formatRange(phaseStart, phaseEnd)}</span>
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function VoterDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [elections, setElections] = useState<ElectionWithPhases[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVoterData();
  }, []);

  const loadVoterData = async () => {
    try {
      setIsLoading(true);

      // Get current profile (voter or admin can view voter dashboard)
      const currentProfile = await getCurrentProfile();
      if (!currentProfile || (currentProfile.role !== 'voter' && currentProfile.role !== 'admin')) {
        toast.error('Unauthorized access');
        navigate('/login');
        return;
      }

      setProfile(currentProfile);

      // Get election IDs for this voter
      const electionIds = await getElectionsForVoter(currentProfile.id);

      // Get detailed election data with phases
      const electionsData = await Promise.all(
        electionIds.map(async (id) => {
          const election = await getElectionWithPhases(id);
          return election;
        })
      );

      setElections(electionsData.filter((e): e is ElectionWithPhases => e !== null));
    } catch (error: any) {
      console.error('Error loading voter data:', error);
      toast.error('Failed to load elections');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <Layout showStepper={false} currentPhase="registration" isAdmin={false}>
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your elections...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Classify elections for the voter based on commit and reveal phase timings
  const classifyElectionByTime = (election: ElectionWithPhases): 'upcoming' | 'ongoing' | 'completed' => {
    const phases = election.phases || [];
    if (!phases.length) {
      return election.status;
    }

    const now = new Date();
    const commitPhase = phases.find((p) => p.phase === 'commit');
    const revealPhase = phases.find((p) => p.phase === 'reveal');

    if (commitPhase) {
      const commitStart = new Date(commitPhase.start_time);
      const revealEnd = revealPhase ? new Date(revealPhase.end_time) : new Date(commitPhase.end_time);

      if (now < commitStart) return 'upcoming';
      if (now > revealEnd) return 'completed';
      return 'ongoing';
    }

    // Fallback: use earliest start and latest end of all phases
    const startTimes = phases.map((p) => new Date(p.start_time).getTime());
    const endTimes = phases.map((p) => new Date(p.end_time).getTime());

    const earliestStart = new Date(Math.min(...startTimes));
    const latestEnd = new Date(Math.max(...endTimes));

    if (now < earliestStart) return 'upcoming';
    if (now > latestEnd) return 'completed';
    return 'ongoing';
  };

  const upcomingElections = elections.filter(e => classifyElectionByTime(e) === 'upcoming');
  const ongoingElections = elections.filter(e => classifyElectionByTime(e) === 'ongoing');
  const completedElections = elections.filter(e => classifyElectionByTime(e) === 'completed');

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin={false}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header row with welcome text and right-side actions */}
        <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between animate-fade-up">
          <div className="space-y-2">
            <p className="trust-badge flex items-center gap-1 w-fit">
              <User className="w-3 h-3" />
              Verified Voter
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {profile.full_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              View and participate in elections assigned to your verified voter profile.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-80">
            {/* Profile card */}
            <div className="official-card p-4 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link to="/voter/profile">
                  Manage
                </Link>
              </Button>
            </div>

            {/* MetaMask connect card */}
            <div className="secure-zone p-4 relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-card/80 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Connect MetaMask</p>
                  <p className="text-xs text-muted-foreground">
                    Link your wallet to sign and verify on-chain actions.
                  </p>
                </div>
              </div>
              <Button variant="vote" size="sm">
                Connect
              </Button>
            </div>
          </div>
        </section>

        {/* Elections sections */}
        <div className="space-y-6">
          <ElectionSection status="ongoing" elections={ongoingElections} />
          <ElectionSection status="upcoming" elections={upcomingElections} />
          <ElectionSection status="completed" elections={completedElections} />
        </div>
      </div>
    </Layout>
  );
}
