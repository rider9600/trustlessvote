import { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { mockElections, ElectionTimelineStatus } from '@/data/mockData';
import { ElectionPhase } from '@/types/election';
import { CalendarClock, Clock, History, ArrowLeft, Vote, Eye, Info } from 'lucide-react';
import { ProcessContent } from './Process';

const phaseLabel: Record<ElectionPhase, string> = {
  registration: 'Registration',
  approval: 'Approval',
  commit: 'Commit Vote',
  reveal: 'Reveal Vote',
  results: 'Results',
};

const statusTitle: Record<ElectionTimelineStatus, string> = {
  upcoming: 'Upcoming Election',
  ongoing: 'Ongoing Election',
  past: 'Completed Election',
};

const statusIcon: Record<ElectionTimelineStatus, typeof CalendarClock> = {
  upcoming: CalendarClock,
  ongoing: Clock,
  past: History,
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

export default function VoterElection() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();

  const election = useMemo(() => mockElections.find((e) => e.id === electionId), [electionId]);

  if (!election) {
    return (
      <Layout currentPhase="registration" isAdmin={false}>
        <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Election not found</h1>
          <p className="text-sm text-muted-foreground">
            The election you tried to access doesn&apos;t exist or is not available in this demo.
          </p>
          <Button variant="outline" onClick={() => navigate('/voter')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Voter Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const StatusIcon = statusIcon[election.timelineStatus];

  const primaryAction = (() => {
    if (election.timelineStatus === 'upcoming') {
      return null;
    }

    if (election.timelineStatus === 'ongoing') {
      if (election.currentPhase === 'commit') {
        return (
          <Button asChild variant="vote" size="lg">
            <Link to="/vote">
              <Vote className="w-4 h-4" />
              Go to Voting
            </Link>
          </Button>
        );
      }

      if (election.currentPhase === 'reveal') {
        return (
          <Button asChild variant="reveal" size="lg">
            <Link to="/vote">
              <Eye className="w-4 h-4" />
              Reveal Your Vote
            </Link>
          </Button>
        );
      }
    }

    // Past elections or results phase
    if (election.timelineStatus === 'past' || election.currentPhase === 'results') {
      return (
        <Button asChild variant="official" size="lg">
          <Link to="/results">
            <History className="w-4 h-4" />
            View Final Results
          </Link>
        </Button>
      );
    }

    return null;
  })();

  return (
    <Layout currentPhase={election.currentPhase} isAdmin={false}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between animate-fade-up">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/voter')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-2">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {election.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <StatusIcon className="w-3 h-3" />
                  {statusTitle[election.timelineStatus]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                You are viewing a summary of this election and the actions available to you at the current stage.
              </p>
            </div>
          </div>
        </section>

        {/* Timing / guidance */}
        <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="secure-zone p-4">
            <div className="relative z-10 flex gap-3">
              <div className="mt-0.5">
                <Info className="w-5 h-5 text-accent" />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-foreground flex items-center gap-2">
                  <span>Current phase: {phaseLabel[election.currentPhase]}</span>
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="w-3 h-3" />
                    {formatRange(election.phaseStart, election.phaseEnd)}
                  </span>
                </p>
                {election.timelineStatus === 'upcoming' && (
                  <p className="text-muted-foreground">
                    This election has not started yet. Review the schedule and prepare to participate once registration opens.
                  </p>
                )}
                {election.timelineStatus === 'ongoing' && election.currentPhase === 'registration' && (
                  <p className="text-muted-foreground">
                    Registration is open. In a full deployment, you would submit your voter registration linked to your wallet.
                  </p>
                )}
                {election.timelineStatus === 'ongoing' && election.currentPhase === 'approval' && (
                  <p className="text-muted-foreground">
                    Your registration is under review. Once approved, you will be able to participate in the commit phase.
                  </p>
                )}
                {election.timelineStatus === 'ongoing' && election.currentPhase === 'commit' && (
                  <p className="text-muted-foreground">
                    The commit phase is active. You can cast an encrypted vote using the dedicated voting page for this demo.
                  </p>
                )}
                {election.timelineStatus === 'ongoing' && election.currentPhase === 'reveal' && (
                  <p className="text-muted-foreground">
                    Reveal phase is active. In a full system, you would reveal your vote to have it counted.
                  </p>
                )}
                {election.timelineStatus === 'past' || election.currentPhase === 'results' ? (
                  <p className="text-muted-foreground">
                    This election has concluded. You can inspect the final results and verify them on-chain.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Primary Action */}
        {primaryAction && (
          <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="official-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-foreground">Next step for this election</p>
                <p className="text-muted-foreground">
                  Use the action button to jump directly to the relevant page in this demo experience.
                </p>
              </div>
              {primaryAction}
            </div>
          </section>
        )}

        {/* Full process information reused from /process, CTA removed for this page */}
        <section className="animate-fade-up" style={{ animationDelay: '250ms' }}>
          <ProcessContent hideCTA />
        </section>
      </div>
    </Layout>
  );
}
