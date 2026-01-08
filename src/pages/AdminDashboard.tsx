import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { ElectionConfig } from '@/types/admin';
import { mockCandidates } from '@/data/mockData';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [elections, setElections] = useState<ElectionConfig[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load elections from localStorage
    const stored = localStorage.getItem('elections');
    if (stored) {
      setElections(JSON.parse(stored));
    } else {
      // Initialize with sample data
      const sampleElections: ElectionConfig[] = [
        {
          id: '1',
          name: '2026 Presidential Election',
          description: 'Upcoming presidential election scheduled for March 2026',
          status: 'upcoming',
          createdAt: '2026-01-05',
          createdBy: 'admin@trustlessvote.com',
          currentPhase: 'registration',
          timeframe: {
            commitPhaseStart: '2026-03-01T00:00',
            commitPhaseEnd: '2026-03-05T23:59',
            revealPhaseStart: '2026-03-06T00:00',
            revealPhaseEnd: '2026-03-10T23:59',
          },
          voters: [
            {
              id: 'v1',
              name: 'John Doe',
              email: 'john@example.com',
              walletAddress: '0x1234...5678',
              registeredAt: '2026-01-06',
              status: 'pending',
            },
            {
              id: 'v2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              walletAddress: '0xabcd...efgh',
              registeredAt: '2026-01-07',
              status: 'approved',
              approvedAt: '2026-01-08',
            },
          ],
          candidates: mockCandidates.map((c, i) => ({
            ...c,
            id: `candidate-upcoming-${i}`,
          })),
        },
        {
          id: '2',
          name: '2024 General Election',
          description: 'National general election for all citizens',
          status: 'ongoing',
          createdAt: '2024-10-01',
          createdBy: 'admin@trustlessvote.com',
          currentPhase: 'commit',
          timeframe: {
            commitPhaseStart: '2024-11-01T00:00',
            commitPhaseEnd: '2024-11-05T23:59',
            revealPhaseStart: '2024-11-06T00:00',
            revealPhaseEnd: '2024-11-08T23:59',
          },
          voters: [
            {
              id: 'v3',
              name: 'Bob Johnson',
              email: 'bob@example.com',
              walletAddress: '0x9876...4321',
              registeredAt: '2024-10-20',
              status: 'approved',
              approvedAt: '2024-10-25',
            },
          ],
          candidates: mockCandidates.map((c, i) => ({
            ...c,
            id: `candidate-ongoing-${i}`,
          })),
        },
        {
          id: '3',
          name: '2023 Municipal Election',
          description: 'City council and mayor election',
          status: 'completed',
          createdAt: '2023-08-15',
          createdBy: 'admin@trustlessvote.com',
          currentPhase: 'results',
          timeframe: {
            commitPhaseStart: '2023-10-01T00:00',
            commitPhaseEnd: '2023-10-15T23:59',
            revealPhaseStart: '2023-10-16T00:00',
            revealPhaseEnd: '2023-10-20T23:59',
          },
          voters: [
            {
              id: 'v4',
              name: 'Alice Williams',
              email: 'alice@example.com',
              walletAddress: '0xfedc...ba98',
              registeredAt: '2023-09-15',
              status: 'revealed',
              approvedAt: '2023-09-20',
              committedAt: '2023-10-10',
              revealedAt: '2023-10-17',
            },
          ],
          candidates: mockCandidates.slice(0, 2).map((c, i) => ({
            ...c,
            id: `candidate-past-${i}`,
          })),
          winnerId: 'candidate-past-0',
          totalVotes: 2500,
        }
      ];
      localStorage.setItem('elections', JSON.stringify(sampleElections));
      setElections(sampleElections);
    }
  }, [refreshKey]);

  // Refresh on window focus to catch localStorage changes
  useEffect(() => {
    const handleFocus = () => {
      const stored = localStorage.getItem('elections');
      if (stored) {
        setElections(JSON.parse(stored));
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const upcomingElections = elections.filter(e => e.status === 'upcoming');
  const ongoingElections = elections.filter(e => e.status === 'ongoing');
  const pastElections = elections.filter(e => e.status === 'completed');

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <section className="flex items-center justify-between animate-fade-up">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Election Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage elections across all phases
            </p>
          </div>
          
          <Button 
            variant="official" 
            size="lg"
            onClick={() => navigate('/admin/create-election')}
          >
            <Plus className="w-5 h-5" />
            Create New Election
          </Button>
        </section>

        {/* Statistics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="official-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{upcomingElections.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Elections</p>
              </div>
            </div>
          </div>

          <div className="official-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{ongoingElections.length}</p>
                <p className="text-sm text-muted-foreground">Ongoing Elections</p>
              </div>
            </div>
          </div>

          <div className="official-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{pastElections.length}</p>
                <p className="text-sm text-muted-foreground">Completed Elections</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="upcoming">Upcoming ({upcomingElections.length})</TabsTrigger>
              <TabsTrigger value="ongoing">Ongoing ({ongoingElections.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastElections.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingElections.length === 0 ? (
                <div className="official-card p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Elections</h3>
                  <p className="text-muted-foreground mb-6">
                    Create a new election to get started
                  </p>
                  <Button variant="official" onClick={() => navigate('/admin/create-election')}>
                    <Plus className="w-4 h-4" />
                    Create Election
                  </Button>
                </div>
              ) : (
                upcomingElections.map(election => (
                  <ElectionCard key={election.id} election={election} />
                ))
              )}
            </TabsContent>

            <TabsContent value="ongoing" className="space-y-4">
              {ongoingElections.length === 0 ? (
                <div className="official-card p-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Ongoing Elections</h3>
                  <p className="text-muted-foreground">
                    Elections will appear here once they start
                  </p>
                </div>
              ) : (
                ongoingElections.map(election => (
                  <ElectionCard key={election.id} election={election} />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastElections.length === 0 ? (
                <div className="official-card p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Past Elections</h3>
                  <p className="text-muted-foreground">
                    Completed elections will be archived here
                  </p>
                </div>
              ) : (
                pastElections.map(election => (
                  <ElectionCard key={election.id} election={election} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
}

function ElectionCard({ election }: { election: ElectionConfig }) {
  const navigate = useNavigate();
  
  const statusConfig = {
    upcoming: { bg: 'bg-warning/10', text: 'text-warning', label: 'Upcoming' },
    ongoing: { bg: 'bg-accent/10', text: 'text-accent', label: 'Ongoing' },
    completed: { bg: 'bg-success/10', text: 'text-success', label: 'Completed' }
  };

  const config = statusConfig[election.status];

  return (
    <div className="official-card p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-foreground">{election.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
              {config.label}
            </span>
          </div>
          
          <p className="text-muted-foreground mb-4">{election.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium text-foreground">
                {new Date(election.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Voters</p>
              <p className="font-medium text-foreground">{election.voters.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Candidates</p>
              <p className="font-medium text-foreground">{election.candidates.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phase</p>
              <p className="font-medium text-foreground capitalize">{election.currentPhase}</p>
            </div>
          </div>

          {election.status === 'completed' && election.winnerId && (
            <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-sm text-success font-medium">
                Winner: {election.candidates.find(c => c.id === election.winnerId)?.name}
              </p>
            </div>
          )}
        </div>

        <Button 
          variant="outline" 
          onClick={() => navigate(`/admin/election/${election.id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
