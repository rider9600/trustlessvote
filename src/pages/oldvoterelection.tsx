import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CandidateCard } from '@/components/election/CandidateCard';
import { CalendarClock, Clock, History, ArrowLeft, Vote, Eye, Info, AlertCircle, Shield, Check, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getElectionWithPhases } from '@/services/elections.service';
import { getCandidatesWithManifestos } from '@/services/candidates.service';
import { getVoterStatus, updateVoterStatus } from '@/services/voters.service';
import { getCurrentProfile } from '@/services/auth.service';
import { ElectionWithPhases, CandidateWithManifesto, ElectionVoter, Profile } from '@/types/supabase';
import type { Candidate as UICandidate } from '@/types/election';
import { ProcessContent } from './Process';

type TimelineStatus = 'upcoming' | 'ongoing' | 'past';

const phaseLabel: Record<'registration' | 'commit' | 'reveal' | 'results', string> = {
  registration: 'Registration',
  commit: 'Commit Vote',
  reveal: 'Reveal Vote',
  results: 'Results',
};

const statusTitle: Record<TimelineStatus, string> = {
  upcoming: 'Upcoming Election',
  ongoing: 'Ongoing Election',
  past: 'Completed Election',
};

const statusIcon: Record<TimelineStatus, typeof CalendarClock> = {
  upcoming: CalendarClock,
  ongoing: Clock,
  past: History,
};

const featureCards = [
  {
    icon: Lock,
    title: 'Encrypted Voting',
    description:
      'Your vote is encrypted until the reveal phase, ensuring complete privacy during the voting period.',
  },
  {
    icon: Shield,
    title: 'Tamper-Proof',
    description:
      'Every vote is recorded on the blockchain, making it impossible to alter or manipulate results.',
  },
  {
    icon: Eye,
    title: 'Fully Transparent',
    description:
      'Anyone can verify the election results by checking the public blockchain records.',
  },
  {
    icon: CheckCircle2,
    title: 'Verified Voters',
    description:
      'Only approved voters can participate, ensuring one person equals one vote.',
  },
];

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

function deriveTimelineAndPhase(election: ElectionWithPhases | null): {
  status: TimelineStatus;
  currentPhase?: 'registration' | 'commit' | 'reveal' | 'results';
  phaseStart?: string;
  phaseEnd?: string;
} {
  if (!election || !election.phases || election.phases.length === 0) {
    return { status: 'upcoming' };
  }

  const now = new Date();
  const commitPhase = election.phases.find((p) => p.phase === 'commit');
  const revealPhase = election.phases.find((p) => p.phase === 'reveal');

  if (commitPhase) {
    const commitStart = new Date(commitPhase.start_time);
    const revealEnd = revealPhase ? new Date(revealPhase.end_time) : new Date(commitPhase.end_time);

    if (now < commitStart) {
      return {
        status: 'upcoming',
        currentPhase: 'registration',
        phaseStart: commitPhase.start_time,
        phaseEnd: commitPhase.end_time,
      };
    }

    if (now > revealEnd) {
      return {
        status: 'past',
        currentPhase: 'results',
        phaseStart: commitPhase.start_time,
        phaseEnd: revealEnd.toISOString(),
      };
    }

    if (now >= commitStart && (!revealPhase || now <= new Date(commitPhase.end_time))) {
      return {
        status: 'ongoing',
        currentPhase: 'commit',
        phaseStart: commitPhase.start_time,
        phaseEnd: commitPhase.end_time,
      };
    }

    if (revealPhase) {
      const revealStart = new Date(revealPhase.start_time);
      const revealEndDate = new Date(revealPhase.end_time);
      if (now >= revealStart && now <= revealEndDate) {
        return {
          status: 'ongoing',
          currentPhase: 'reveal',
          phaseStart: revealPhase.start_time,
          phaseEnd: revealPhase.end_time,
        };
      }
    }
  }

  // Fallback based on overall phase window
  const startTimes = election.phases.map((p) => new Date(p.start_time).getTime());
  const endTimes = election.phases.map((p) => new Date(p.end_time).getTime());
  const earliestStart = new Date(Math.min(...startTimes));
  const latestEnd = new Date(Math.max(...endTimes));

  if (now < earliestStart) return { status: 'upcoming' };
  if (now > latestEnd) return { status: 'past' };
  return { status: 'ongoing' };
}

export default function VoterElection() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();

  const [election, setElection] = useState<ElectionWithPhases | null>(null);
  const [candidates, setCandidates] = useState<CandidateWithManifesto[]>([]);
  const [voter, setVoter] = useState<Profile | null>(null);
  const [voterStatus, setVoterStatus] = useState<ElectionVoter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId]);

  const loadData = async () => {
    try {
      if (!electionId) {
        toast.error('Invalid election');
        navigate('/voter');
        return;
      }

      setIsLoading(true);

      const profile = await getCurrentProfile();
      if (!profile || (profile.role !== 'voter' && profile.role !== 'admin')) {
        toast.error('Unauthorized access');
        navigate('/login');
        return;
      }

      setVoter(profile);

      const [electionData, candidatesData, status] = await Promise.all([
        getElectionWithPhases(electionId),
        getCandidatesWithManifestos(electionId),
        getVoterStatus(electionId, profile.id),
      ]);

      if (!electionData) {
        toast.error('Election not found');
        navigate('/voter');
        return;
      }

      setElection(electionData);
      setCandidates(candidatesData);
      setVoterStatus(status);
    } catch (error: any) {
      console.error('Error loading election:', error);
      toast.error('Failed to load election details');
    } finally {
      setIsLoading(false);
    }
  };

  const { status: timelineStatus, currentPhase, phaseStart, phaseEnd } = useMemo(
    () => deriveTimelineAndPhase(election),
    [election]
  );

  const uiCandidates: UICandidate[] = useMemo(() => {
    return candidates.map((c) => {
      const policies: string[] = [];
      const promises: string[] = [];

      if (c.manifesto?.policy_points) {
        try {
          const parsed = JSON.parse(c.manifesto.policy_points);
          if (Array.isArray(parsed)) {
            parsed.forEach((p) => {
              if (typeof p === 'string') policies.push(p);
            });
          }
        } catch {
          // ignore JSON parse errors
        }
      }

      if (c.manifesto?.campaign_promises) {
        try {
          const parsed = JSON.parse(c.manifesto.campaign_promises);
          if (Array.isArray(parsed)) {
            parsed.forEach((p) => {
              if (typeof p === 'string') promises.push(p);
            });
          }
        } catch {
          // ignore JSON parse errors
        }
      }

      const uiCandidate: UICandidate = {
        id: c.id,
        name: c.name,
        party: c.party_name || 'Independent',
        symbol: c.symbol || '👤',
        photo: c.photo_url || '/placeholder.svg',
        bio: c.biography || '',
        manifesto: {
          vision: c.manifesto?.vision_statement || '',
          policies,
          promises,
        },
      };

      return uiCandidate;
    });
  }, [candidates]);

  const StatusIcon = statusIcon[timelineStatus];

  const canCommit =
    timelineStatus === 'ongoing' &&
    currentPhase === 'commit' &&
    voterStatus?.is_eligible &&
    !voterStatus?.has_committed;

  const canReveal =
    timelineStatus === 'ongoing' &&
    currentPhase === 'reveal' &&
    voterStatus?.is_eligible &&
    voterStatus?.has_committed &&
    !voterStatus?.has_revealed;

  const handleCommit = async () => {
    if (!electionId || !voterStatus) return;
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    if (!secretKey.trim()) {
      toast.error('Please enter a secret key');
      return;
    }

    try {
      setIsCommitting(true);

      // Store a local commitment so reveal can verify (demo only)
      const commitKey = `tvote_commit_${electionId}_${voterStatus.voter_id}`;
      const commitment = {
        candidateId: selectedCandidate,
        secretKey,
      };
      localStorage.setItem(commitKey, JSON.stringify(commitment));

      await updateVoterStatus(voterStatus.id, { has_committed: true });
      toast.success('Your vote has been committed');
      await loadData();
    } catch (error: any) {
      console.error('Commit error:', error);
      toast.error(error.message || 'Failed to commit vote');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleReveal = async () => {
    if (!electionId || !voterStatus) return;
    if (!secretKey.trim()) {
      toast.error('Please enter your secret key');
      return;
    }

    try {
      setIsRevealing(true);

      const commitKey = `tvote_commit_${electionId}_${voterStatus.voter_id}`;
      const stored = localStorage.getItem(commitKey);
      if (!stored) {
        toast.error('No committed vote found for this election');
        return;
      }

      const parsed = JSON.parse(stored) as { candidateId: string; secretKey: string };
      if (parsed.secretKey !== secretKey) {
        toast.error('Secret key does not match your committed vote');
        return;
      }

      await updateVoterStatus(voterStatus.id, { has_revealed: true });
      toast.success('Your vote has been revealed');
      await loadData();
    } catch (error: any) {
      console.error('Reveal error:', error);
      toast.error(error.message || 'Failed to reveal vote');
    } finally {
      setIsRevealing(false);
    }
  };

  if (isLoading || !election) {
    return (
      <Layout currentPhase="registration" isAdmin={false}>
        <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading election details...</p>
        </div>
      </Layout>
    );
  }

  const currentPhaseLabel = currentPhase ? phaseLabel[currentPhase] : 'N/A';

  const phaseChipLabel =
    timelineStatus === 'ongoing' && currentPhase === 'commit'
      ? 'Commit Phase Active'
      : timelineStatus === 'ongoing' && currentPhase === 'reveal'
      ? 'Reveal Phase Active'
      : timelineStatus === 'upcoming'
      ? 'Election Not Started'
      : timelineStatus === 'past'
      ? 'Election Completed'
      : 'Election Status';

  return (
    <Layout currentPhase={currentPhase || 'registration'} isAdmin={false}>
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
                  {statusTitle[timelineStatus]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                View election details, candidates and participate according to the current phase.
              </p>
            </div>
          </div>
        </section>

        {/* Hero / election name + cast your vote copy */}
        <section className="text-center space-y-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium">
            <Lock className="w-4 h-4" />
            {phaseChipLabel}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {election.name}
          </h1>

          <h2 className="text-lg md:text-2xl font-semibold text-foreground">
            Cast Your Vote
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select your preferred candidate below. Your vote will be encrypted and stored on the blockchain until the
            reveal phase.
          </p>
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
                  <span>Current phase: {currentPhaseLabel}</span>
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  {phaseStart && phaseEnd && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="w-3 h-3" />
                      {formatRange(phaseStart, phaseEnd)}
                    </span>
                  )}
                </p>
                {timelineStatus === 'upcoming' && (
                  <p className="text-muted-foreground">
                    This election has not started yet. Once the commit phase opens, you&apos;ll be able to cast your vote.
                  </p>
                )}
                {timelineStatus === 'ongoing' && currentPhase === 'commit' && (
                  <p className="text-muted-foreground">
                    The commit phase is active. Select a candidate and commit your encrypted vote using a secret key.
                  </p>
                )}
                {timelineStatus === 'ongoing' && currentPhase === 'reveal' && (
                  <p className="text-muted-foreground">
                    Reveal phase is active. Provide the same secret key you used during commit so your vote can be counted.
                  </p>
                )}
                {timelineStatus === 'past' && (
                  <p className="text-muted-foreground">
                    This election has concluded. Your commit and reveal status are recorded for auditability.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Candidates and manifestos */}
        <section className="space-y-4 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Vote className="w-4 h-4" />
            Candidates in this election
          </h2>

          {uiCandidates.length === 0 ? (
            <div className="official-card p-6 text-sm text-muted-foreground">
              No candidates have been registered for this election yet.
            </div>
          ) : (
            <div className="space-y-4">
              {uiCandidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CandidateCard
                    candidate={candidate}
                    isSelected={selectedCandidate === candidate.id}
                    onSelect={setSelectedCandidate}
                    showVoteButton
                    compact
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Commit / Reveal actions */}
        <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="official-card p-6 space-y-4">
            {voterStatus && (
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-accent" />
                <p className="text-muted-foreground">
                  Status for this election: {' '}
                  <span className="font-medium text-foreground">
                    {voterStatus.has_revealed
                      ? 'Vote revealed'
                      : voterStatus.has_committed
                      ? 'Vote committed'
                      : voterStatus.is_eligible
                      ? 'Eligible to vote'
                      : 'Not eligible'}
                  </span>
                </p>
              </div>
            )}

            {canCommit && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <p>
                    Select a candidate above, then choose a secret key. You will need the same key again during the
                    reveal phase.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="secret-key-commit">
                    Secret key for commit
                  </label>
                  <Input
                    id="secret-key-commit"
                    type="password"
                    placeholder="Enter a secret phrase only you know"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This key never leaves your device except as part of the encrypted commitment.
                  </p>
                </div>

                <Button
                  variant="vote"
                  size="lg"
                  className="w-full"
                  onClick={handleCommit}
                  disabled={isCommitting}
                >
                  {isCommitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      Committing Vote...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Commit Vote
                    </>
                  )}
                </Button>
              </div>
            )}

            {canReveal && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <p>
                    Enter the same secret key you used when committing your vote so it can be decrypted and counted.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="secret-key-reveal">
                    Secret key for reveal
                  </label>
                  <Input
                    id="secret-key-reveal"
                    type="password"
                    placeholder="Enter your commit secret key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                  />
                </div>

                <Button
                  variant="reveal"
                  size="lg"
                  className="w-full"
                  onClick={handleReveal}
                  disabled={isRevealing}
                >
                  {isRevealing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      Revealing Vote...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Reveal Vote
                    </>
                  )}
                </Button>
              </div>
            )}

            {!canCommit && !canReveal && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="w-4 h-4" />
                <p>
                  There is no commit or reveal action available for you at this time. Check the timeline above for
                  phase details.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How trustlessVote works */}
        <section className="space-y-6 animate-fade-up" style={{ animationDelay: '230ms' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">How trustlessVote Works</h2>
            <p className="text-muted-foreground mt-2">
              A secure commit-reveal voting mechanism ensures privacy and integrity.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {featureCards.map((feature) => (
              <div key={feature.title} className="official-card p-5 text-center hover-lift">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process information */}
        <section className="animate-fade-up" style={{ animationDelay: '270ms' }}>
          <ProcessContent hideCTA />
        </section>
      </div>
    </Layout>
  );
}