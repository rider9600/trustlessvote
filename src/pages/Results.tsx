import { Trophy, CheckCircle2, Users, ExternalLink, Clock, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CandidateCard } from '@/components/election/CandidateCard';
import { mockCandidates, mockElectionState } from '@/data/mockData';
import { Button } from '@/components/ui/button';

// Sort candidates by votes for results display
const sortedCandidates = [...mockCandidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
const winner = sortedCandidates[0];
const totalVotes = sortedCandidates.reduce((sum, c) => sum + (c.votes || 0), 0);

export default function ResultsPage() {
  return (
    <Layout currentPhase="results">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Victory Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent p-8 text-center animate-scale-in">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
              <Trophy className="w-4 h-4" />
              Election Concluded
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Official Results Declared
            </h1>
            
            <p className="text-white/80 max-w-xl mx-auto">
              {mockElectionState.electionName} has concluded. 
              The results are final and verified on the blockchain.
            </p>
          </div>
        </section>

        {/* Winner Highlight */}
        <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="official-card p-6 border-2 border-success">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-success" />
              <h2 className="font-semibold text-foreground">Winner</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-success/10 flex items-center justify-center">
                <span className="text-5xl">{winner.symbol}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground">{winner.name}</h3>
                <p className="text-muted-foreground">{winner.party}</p>
                
                <div className="mt-3 flex items-center gap-4">
                  <div>
                    <p className="text-3xl font-bold text-success">{winner.votes?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Votes</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {((winner.votes || 0) / totalVotes * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Vote Share</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vote Distribution */}
        <section className="space-y-4 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-lg font-semibold text-foreground">Vote Distribution</h2>
          
          <div className="space-y-3">
            {sortedCandidates.map((candidate, index) => {
              const percentage = ((candidate.votes || 0) / totalVotes * 100);
              return (
                <div key={candidate.id} className="official-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground font-semibold">
                      {index + 1}
                    </div>
                    
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-xl">{candidate.symbol}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{candidate.name}</p>
                        <p className="font-bold text-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            index === 0 ? 'bg-success' : 'bg-accent'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <p className="font-semibold text-foreground">{candidate.votes?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">votes</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="official-card p-4 text-center">
            <Users className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalVotes.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Votes</p>
          </div>
          <div className="official-card p-4 text-center">
            <CheckCircle2 className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{mockElectionState.totalApproved.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Eligible Voters</p>
          </div>
          <div className="official-card p-4 text-center">
            <Trophy className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">22.0%</p>
            <p className="text-sm text-muted-foreground">Voter Turnout</p>
          </div>
          <div className="official-card p-4 text-center">
            <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">8 Days</p>
            <p className="text-sm text-muted-foreground">Election Duration</p>
          </div>
        </section>

        {/* Verification */}
        <section className="official-card p-6 animate-fade-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Blockchain Verification</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All results are cryptographically verified and permanently recorded on the blockchain. 
                Anyone can independently verify the election outcome.
              </p>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View on Explorer
                </Button>
                <Button variant="ghost" size="sm">
                  Download Audit Report
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contract Address</span>
                <code className="font-mono text-foreground">0x1234...abcd</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Results Block</span>
                <span className="font-mono text-foreground">#18,245,892</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Finalized At</span>
                <span className="text-foreground">Nov 8, 2024, 6:00 PM UTC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Merkle Root</span>
                <code className="font-mono text-foreground">0x8f2e...a1b4</code>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
