import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentProfile } from '@/services/auth.service';
import { getElectionsByAdmin, getElectionPhases, refreshAdminStats } from '@/services/elections.service';
import { Election, ElectionPhase } from '@/types/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    totalVoters: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const classifyElectionByTime = (election: Election, phases: ElectionPhase[]): 'upcoming' | 'ongoing' | 'completed' => {
    if (!phases || phases.length === 0) {
      return election.status;
    }

    const now = new Date();
    const startTimes = phases.map((p) => new Date(p.start_time).getTime());
    const endTimes = phases.map((p) => new Date(p.end_time).getTime());

    const earliestStart = new Date(Math.min(...startTimes));
    const latestEnd = new Date(Math.max(...endTimes));

    if (now < earliestStart) return 'upcoming';
    if (now > latestEnd) return 'completed';
    return 'ongoing';
  };

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      // Get current admin profile
      const profile = await getCurrentProfile();
      if (!profile || profile.role !== 'admin') {
        toast.error('Unauthorized access');
        navigate('/login');
        return;
      }

      setAdminId(profile.id);

      // Get elections for this admin
      const adminElections = await getElectionsByAdmin(profile.id);

      // Derive upcoming/ongoing/completed from phase timings
      const electionsWithTimeline = await Promise.all(
        adminElections.map(async (election) => {
          const phases = await getElectionPhases(election.id);
          const statusByTime = classifyElectionByTime(election, phases);
          return { ...election, status: statusByTime } as Election;
        })
      );

      setElections(electionsWithTimeline);

      // Calculate stats based on derived status
      const upcomingCount = electionsWithTimeline.filter((e) => e.status === 'upcoming').length;
      const ongoingCount = electionsWithTimeline.filter((e) => e.status === 'ongoing').length;
      const completedCount = electionsWithTimeline.filter((e) => e.status === 'completed').length;

      setStats({
        upcoming: upcomingCount,
        ongoing: ongoingCount,
        completed: completedCount,
        totalVoters: 0, // Will be calculated from election_voters table if needed
      });

      // Update admin stats in database
      await refreshAdminStats(profile.id);
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingElections = elections.filter(e => e.status === 'upcoming');
  const ongoingElections = elections.filter(e => e.status === 'ongoing');
  const pastElections = elections.filter(e => e.status === 'completed');

  if (isLoading) {
    return (
      <Layout showStepper={false} currentPhase="registration" isAdmin>
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
                <p className="text-3xl font-bold text-foreground">{stats.upcoming}</p>
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
                <p className="text-3xl font-bold text-foreground">{stats.ongoing}</p>
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
                <p className="text-3xl font-bold text-foreground">{stats.completed}</p>
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

function ElectionCard({ election }: { election: Election }) {
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
          
          <p className="text-muted-foreground mb-4">{election.description || 'No description provided'}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium text-foreground">
                {new Date(election.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Election ID</p>
              <p className="font-medium text-foreground font-mono text-xs">
                {election.id.substring(0, 8)}...
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium text-foreground capitalize">{election.status}</p>
            </div>
          </div>
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
