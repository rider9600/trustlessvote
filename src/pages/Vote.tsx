import { useState } from 'react';
import { Lock, Shield, AlertCircle, Check, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CandidateCard } from '@/components/election/CandidateCard';
import { VoterStatusCard } from '@/components/election/VoterStatusCard';
import { mockCandidates } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function VotePage() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);

  const handleCommit = async () => {
    if (!selectedCandidate) return;
    
    setIsCommitting(true);
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCommitting(false);
    setIsCommitted(true);
  };

  const selectedCandidateData = mockCandidates.find(c => c.id === selectedCandidate);

  if (isCommitted) {
    return (
      <Layout currentPhase="commit">
        <div className="max-w-2xl mx-auto">
          <div className="official-card p-8 text-center space-y-6 animate-scale-in">
            <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-success" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Vote Successfully Committed</h1>
              <p className="text-muted-foreground">
                Your encrypted vote has been recorded on the blockchain.
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-foreground">0x8f2e...a1b4</code>
                  <ExternalLink className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Block Number</span>
                <span className="font-mono text-foreground">18,234,567</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Timestamp</span>
                <span className="text-foreground">Nov 4, 2024, 2:34 PM UTC</span>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-accent mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">What's Next?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    During the reveal phase, you'll need to reveal your vote to have it counted. 
                    Keep your wallet connected and watch for notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPhase="commit">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center space-y-4 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium">
            <Lock className="w-4 h-4" />
            Commit Phase Active
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Cast Your Vote
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select your preferred candidate below. Your vote will be encrypted and 
            stored on the blockchain until the reveal phase.
          </p>
        </section>

        {/* Voter Status */}
        <VoterStatusCard status="approved" walletAddress="0x1234...5678" />

        {/* Privacy Notice */}
        <div className="secure-zone p-4 animate-fade-up">
          <div className="relative z-10 flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Your vote is private</p>
              <p className="text-sm text-muted-foreground mt-1">
                During the commit phase, your vote is encrypted using a secret key only you possess. 
                No one—not even election administrators—can see your choice until you reveal it.
              </p>
            </div>
          </div>
        </div>

        {/* Candidates */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Select a Candidate</h2>
          <div className="space-y-4">
            {mockCandidates.map((candidate, index) => (
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
        </section>

        {/* Commit Action */}
        <section className={cn(
          "official-card p-6 space-y-4 transition-all duration-300",
          selectedCandidate ? "ring-2 ring-accent" : ""
        )}>
          {selectedCandidate ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Candidate</p>
                  <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span>{selectedCandidateData?.symbol}</span>
                    {selectedCandidateData?.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCandidate(null)}
                  className="text-muted-foreground"
                >
                  Change
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <Button
                  variant="vote"
                  size="xl"
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
                      <Lock className="w-5 h-5" />
                      Commit Vote to Blockchain
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  This will submit a blockchain transaction. You'll need to confirm in your wallet.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">Select a candidate above to proceed with voting</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
