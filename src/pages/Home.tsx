import { ArrowRight, Shield, Lock, Eye, CheckCircle2, Users, Vote, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { PhaseIndicator } from '@/components/election/PhaseIndicator';
import { VoterStatusCard } from '@/components/election/VoterStatusCard';
import { mockElectionState } from '@/data/mockData';

const features = [
  {
    icon: Lock,
    title: 'Encrypted Voting',
    description: 'Your vote is encrypted until the reveal phase, ensuring complete privacy during the voting period.'
  },
  {
    icon: Shield,
    title: 'Tamper-Proof',
    description: 'Every vote is recorded on the blockchain, making it impossible to alter or manipulate results.'
  },
  {
    icon: Eye,
    title: 'Fully Transparent',
    description: 'Anyone can verify the election results by checking the public blockchain records.'
  },
  {
    icon: CheckCircle2,
    title: 'Verified Voters',
    description: 'Only approved voters can participate, ensuring one person equals one vote.'
  }
];

const stats = [
  { label: 'Registered Voters', value: mockElectionState.totalRegistered.toLocaleString(), icon: Users },
  { label: 'Approved', value: mockElectionState.totalApproved.toLocaleString(), icon: CheckCircle2 },
  { label: 'Votes Committed', value: mockElectionState.totalCommitted.toLocaleString(), icon: Vote },
  { label: 'Turnout Rate', value: '58.7%', icon: BarChart3 },
];

export default function HomePage() {
  return (
    <Layout currentPhase="commit">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium">
            <Shield className="w-4 h-4" />
            Secure Blockchain Election
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            {mockElectionState.electionName}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Participate in a transparent, secure, and verifiable election process. 
            Your vote matters and is protected by blockchain technology.
          </p>

          <PhaseIndicator phase="commit" className="mx-auto" />
        </section>

        {/* Voter Status */}
        <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <VoterStatusCard 
            status="approved" 
            walletAddress="0x1234...5678" 
          />
        </section>

        {/* Quick Actions */}
        <section className="grid md:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="secure-zone p-6">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Cast Your Vote</h3>
              <p className="text-muted-foreground">
                The commit phase is active. Select your candidate and submit your encrypted vote to the blockchain.
              </p>
              <Button variant="vote" size="lg" asChild>
                <Link to="/vote">
                  Vote Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="official-card p-6 space-y-4">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">View Nominees</h3>
            <p className="text-muted-foreground">
              Learn about the candidates running in this election. Read their manifestos and make an informed decision.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/nominees">
                See All Candidates
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="official-card p-4 text-center">
                <stat.icon className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-6 animate-fade-up" style={{ animationDelay: '250ms' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">How trustlessVote Works</h2>
            <p className="text-muted-foreground mt-2">
              A secure commit-reveal voting mechanism ensures privacy and integrity
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature) => (
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

        {/* Election Timeline */}
        <section className="official-card p-6 space-y-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-foreground">Election Timeline</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Election Start</span>
              <span className="font-medium text-foreground">November 1, 2024</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Registration Deadline</span>
              <span className="font-medium text-foreground">November 3, 2024</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Commit Phase Ends</span>
              <span className="font-medium text-foreground">November 6, 2024</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Results Declaration</span>
              <span className="font-medium text-foreground">November 8, 2024</span>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
