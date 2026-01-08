import { CalendarClock, Clock, History, User, Wallet } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { demoVoter, mockElections, ElectionTimelineStatus } from '@/data/mockData';
import { ElectionPhase } from '@/types/election';
import { Link } from 'react-router-dom';

const phaseLabel: Record<ElectionPhase, string> = {
  registration: 'Registration',
  approval: 'Approval',
  commit: 'Commit Vote',
  reveal: 'Reveal Vote',
  results: 'Results',
};

const statusTitle: Record<ElectionTimelineStatus, string> = {
  upcoming: 'Upcoming Elections',
  ongoing: 'Ongoing Elections',
  past: 'Past Elections',
};

const statusDescription: Record<ElectionTimelineStatus, string> = {
  upcoming: 'Elections you can prepare for in advance.',
  ongoing: 'Active elections where you can participate now.',
  past: 'Completed elections with final, verifiable results.',
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

function ElectionSection({ status }: { status: ElectionTimelineStatus }) {
  const elections = mockElections.filter((e) => e.timelineStatus === status);
  if (!elections.length) return null;

  return (
    <section className="space-y-4 animate-fade-up">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {status === 'upcoming' && <CalendarClock className="w-4 h-4 text-primary" />}
          {status === 'ongoing' && <Clock className="w-4 h-4 text-accent" />}
          {status === 'past' && <History className="w-4 h-4 text-muted-foreground" />}
          {statusTitle[status]}
        </h2>
        <p className="text-sm text-muted-foreground">{statusDescription[status]}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {elections.map((election) => (
          <Link
            key={election.id}
            to={`/voter/election/${election.id}`}
            className="official-card p-4 flex flex-col justify-between hover-lift"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {election.id}
              </p>
              <h3 className="text-base font-semibold text-foreground">
                {election.name}
              </h3>

              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-phase-active" />
                <span className="uppercase tracking-wide text-muted-foreground">Current Phase</span>
                <span className="text-foreground">{phaseLabel[election.currentPhase]}</span>
              </div>

              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="w-4 h-4" />
                <span>Phase window: {formatRange(election.phaseStart, election.phaseEnd)}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function VoterDashboard() {
  const initials = demoVoter.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
              Welcome back, {demoVoter.name}
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
                <p className="text-sm font-semibold text-foreground truncate">{demoVoter.name}</p>
                <p className="text-xs text-muted-foreground truncate">{demoVoter.email}</p>
                <p className="mt-1 text-[11px] font-mono text-muted-foreground truncate">
                  {demoVoter.walletAddress}
                </p>
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
          <ElectionSection status="ongoing" />
          <ElectionSection status="upcoming" />
          <ElectionSection status="past" />
        </div>
      </div>
    </Layout>
  );
}
