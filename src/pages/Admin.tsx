import { useState } from 'react';
import { 
  Settings, Users, CheckCircle2, XCircle, Clock, 
  Play, Pause, SkipForward, Shield, FileText, 
  UserCheck, AlertCircle
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { mockVoters, mockElectionState } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { VoterStatus, ElectionPhase } from '@/types/election';

const phaseActions: Record<ElectionPhase, { label: string; nextPhase: ElectionPhase | null }> = {
  registration: { label: 'Start Approval Phase', nextPhase: 'approval' },
  approval: { label: 'Start Commit Phase', nextPhase: 'commit' },
  commit: { label: 'Start Reveal Phase', nextPhase: 'reveal' },
  reveal: { label: 'Declare Results', nextPhase: 'results' },
  results: { label: 'Election Complete', nextPhase: null }
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'voters' | 'phases' | 'logs'>('voters');
  const [currentPhase, setCurrentPhase] = useState<ElectionPhase>('commit');
  const [voters, setVoters] = useState(mockVoters);

  const handleApprove = (id: string) => {
    setVoters(prev => prev.map(v => 
      v.id === id ? { ...v, status: 'approved' as VoterStatus } : v
    ));
  };

  const handleReject = (id: string) => {
    setVoters(prev => prev.map(v => 
      v.id === id ? { ...v, status: 'rejected' as VoterStatus } : v
    ));
  };

  const pendingVoters = voters.filter(v => v.status === 'pending');
  const approvedVoters = voters.filter(v => v.status === 'approved' || v.status === 'committed' || v.status === 'revealed');
  const rejectedVoters = voters.filter(v => v.status === 'rejected');

  return (
    <Layout currentPhase={currentPhase} showStepper={false}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Admin Header */}
        <section className="flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">{mockElectionState.electionName}</p>
            </div>
          </div>
          
          <div className="trust-badge">
            <Shield className="w-4 h-4" />
            Admin Access Verified
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up">
          <div className="official-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{voters.length}</p>
                <p className="text-sm text-muted-foreground">Total Registered</p>
              </div>
            </div>
          </div>
          <div className="official-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingVoters.length}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </div>
          <div className="official-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{approvedVoters.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </div>
          <div className="official-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{rejectedVoters.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </div>
        </section>

        {/* Phase Control */}
        <section className="official-card p-6 animate-fade-up">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Phase Control
          </h2>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm text-muted-foreground mb-1">Current Phase</p>
              <p className="text-lg font-semibold text-foreground capitalize">{currentPhase}</p>
            </div>
            
            <Button
              variant="official"
              size="lg"
              onClick={() => {
                const next = phaseActions[currentPhase].nextPhase;
                if (next) setCurrentPhase(next);
              }}
              disabled={!phaseActions[currentPhase].nextPhase}
            >
              <SkipForward className="w-4 h-4" />
              {phaseActions[currentPhase].label}
            </Button>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {[
            { id: 'voters', label: 'Voter Approvals', icon: UserCheck },
            { id: 'phases', label: 'Phase History', icon: Clock },
            { id: 'logs', label: 'Audit Logs', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <section className="animate-fade-up">
          {activeTab === 'voters' && (
            <div className="space-y-4">
              {/* Pending Section */}
              {pendingVoters.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning" />
                    Pending Approval ({pendingVoters.length})
                  </h3>
                  {pendingVoters.map(voter => (
                    <div key={voter.id} className="official-card p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{voter.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{voter.walletAddress}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registered: {new Date(voter.registeredAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(voter.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button
                          variant="vote"
                          size="sm"
                          onClick={() => handleApprove(voter.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pendingVoters.length === 0 && (
                <div className="official-card p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-3" />
                  <p className="text-foreground font-medium">All Caught Up</p>
                  <p className="text-sm text-muted-foreground">No pending voter approvals at this time.</p>
                </div>
              )}

              {/* Approved Section */}
              <div className="space-y-3 mt-6">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Approved Voters ({approvedVoters.length})
                </h3>
                <div className="official-card overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Wallet</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Approved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {approvedVoters.map(voter => (
                        <tr key={voter.id}>
                          <td className="p-3 text-sm text-foreground">{voter.name}</td>
                          <td className="p-3 text-sm font-mono text-muted-foreground">{voter.walletAddress}</td>
                          <td className="p-3">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              voter.status === 'committed' && "bg-accent/10 text-accent",
                              voter.status === 'revealed' && "bg-success/10 text-success",
                              voter.status === 'approved' && "bg-primary/10 text-primary"
                            )}>
                              {voter.status}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {voter.approvedAt ? new Date(voter.approvedAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phases' && (
            <div className="official-card p-6">
              <p className="text-muted-foreground text-center py-8">
                Phase history will be displayed here as the election progresses.
              </p>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="official-card p-6">
              <p className="text-muted-foreground text-center py-8">
                Audit logs and blockchain transaction history will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
