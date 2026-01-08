import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ElectionConfig } from '@/types/admin';
import { 
  ArrowLeft, Calendar, Users, Vote, Trophy, 
  Clock, CheckCircle2, XCircle, Eye 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CandidateCard } from '@/components/election/CandidateCard';

export default function ElectionDetails() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<ElectionConfig | null>(null);

  useEffect(() => {
    // Load from localStorage
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const found = elections.find((e: ElectionConfig) => e.id === electionId);
    setElection(found || null);
  }, [electionId]);

  if (!election) {
    return (
      <Layout showStepper={false} currentPhase="registration" isAdmin>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Election Not Found</h1>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const statusConfig = {
    upcoming: { bg: 'bg-warning/10', text: 'text-warning', label: 'Upcoming', icon: Calendar },
    ongoing: { bg: 'bg-accent/10', text: 'text-accent', label: 'Ongoing', icon: Clock },
    completed: { bg: 'bg-success/10', text: 'text-success', label: 'Completed', icon: CheckCircle2 }
  };

  const config = statusConfig[election.status];
  const StatusIcon = config.icon;

  const winner = election.winnerId 
    ? election.candidates.find(c => c.id === election.winnerId)
    : null;

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <section className="flex items-center gap-4 animate-fade-up">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground">{election.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${config.bg} ${config.text}`}>
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </span>
            </div>
            <p className="text-muted-foreground">{election.description}</p>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="official-card p-4 text-center">
            <Users className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{election.voters.length}</p>
            <p className="text-sm text-muted-foreground">Voters</p>
          </div>
          <div className="official-card p-4 text-center">
            <Vote className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{election.candidates.length}</p>
            <p className="text-sm text-muted-foreground">Candidates</p>
          </div>
          <div className="official-card p-4 text-center">
            <CheckCircle2 className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground capitalize">{election.currentPhase}</p>
            <p className="text-sm text-muted-foreground">Current Phase</p>
          </div>
          <div className="official-card p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-bold text-foreground">
              {new Date(election.timeframe.commitPhaseStart).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">Start Date</p>
          </div>
          <div className="official-card p-4 text-center">
            <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-bold text-foreground">
              {new Date(election.timeframe.revealPhaseEnd).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">End Date</p>
          </div>
        </section>

        {/* Winner Card (if completed) */}
        {election.status === 'completed' && winner && (
          <section className="official-card p-6 border-2 border-success animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-success" />
              <h2 className="text-xl font-semibold text-foreground">Election Winner</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center">
                <span className="text-4xl">{winner.symbol || '👤'}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground">{winner.name}</h3>
                <p className="text-muted-foreground mb-3">{winner.party}</p>
                
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-3xl font-bold text-success">{winner.votes?.toLocaleString() || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Votes</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {election.totalVotes ? ((winner.votes || 0) / election.totalVotes * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Vote Share</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Tabs defaultValue="candidates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="candidates">Candidates ({election.candidates.length})</TabsTrigger>
              <TabsTrigger value="voters">Voters ({election.voters.length})</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="candidates" className="space-y-4 mt-6">
              {election.candidates.length === 0 ? (
                <div className="official-card p-8 text-center">
                  <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No candidates added yet</p>
                </div>
              ) : (
                election.candidates.map(candidate => (
                  <CandidateCard 
                    key={candidate.id} 
                    candidate={candidate} 
                    showVotes={election.status === 'completed'}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="voters" className="space-y-4 mt-6">
              {election.voters.length === 0 ? (
                <div className="official-card p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No voters registered yet</p>
                </div>
              ) : (
                <div className="official-card p-6">
                  <div className="space-y-3">
                    {election.voters.map((voter, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{voter.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {voter.email && `${voter.email} • `}
                            {voter.walletAddress}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {voter.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-success" />}
                          {voter.status === 'pending' && <Clock className="w-4 h-4 text-warning" />}
                          {voter.status === 'rejected' && <XCircle className="w-4 h-4 text-destructive" />}
                          {voter.status === 'revealed' && <Eye className="w-4 h-4 text-accent" />}
                          <span className="text-sm capitalize text-muted-foreground">{voter.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <div className="official-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Election Timeline</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Commit Phase Start</p>
                      <p className="text-sm text-muted-foreground">Voters can cast encrypted votes</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(election.timeframe.commitPhaseStart).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Commit Phase End</p>
                      <p className="text-sm text-muted-foreground">Last chance to commit votes</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(election.timeframe.commitPhaseEnd).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Reveal Phase Start</p>
                      <p className="text-sm text-muted-foreground">Voters reveal their votes</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(election.timeframe.revealPhaseStart).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Reveal Phase End</p>
                      <p className="text-sm text-muted-foreground">Final tallying and results</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(election.timeframe.revealPhaseEnd).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
}
