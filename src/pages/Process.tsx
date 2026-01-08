import { Layout } from '@/components/layout/Layout';
import { Shield, ArrowRight, Lock, Eye, CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const steps = [
  {
    phase: 'Registration',
    icon: Users,
    description: 'Voters submit their registration with wallet verification. This creates a verifiable identity linked to your blockchain address.',
    details: [
      'Connect your wallet to the platform',
      'Submit required identification for verification',
      'Receive registration confirmation on-chain'
    ]
  },
  {
    phase: 'Approval',
    icon: CheckCircle2,
    description: 'Election administrators review and approve voter registrations, ensuring only eligible participants can vote.',
    details: [
      'Admin reviews each registration request',
      'Identity verification is completed',
      'Approved voters receive voting rights'
    ]
  },
  {
    phase: 'Commit Vote',
    icon: Lock,
    description: 'Cast your encrypted vote. Your choice is hidden using cryptographic commitment until the reveal phase.',
    details: [
      'Select your preferred candidate',
      'Vote is encrypted with your secret key',
      'Encrypted commitment stored on blockchain'
    ]
  },
  {
    phase: 'Reveal Vote',
    icon: Eye,
    description: 'Reveal your vote by providing your secret key. This proves your vote matches your commitment.',
    details: [
      'Submit your secret to reveal your vote',
      'System verifies commitment matches reveal',
      'Your vote is counted toward final tally'
    ]
  },
  {
    phase: 'Results',
    icon: Shield,
    description: 'Final results are computed and published on-chain. Anyone can verify the outcome independently.',
    details: [
      'All votes are tallied automatically',
      'Results are permanently recorded',
      'Full audit trail available publicly'
    ]
  }
];

export default function ProcessPage() {
  return (
    <Layout currentPhase="commit">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <section className="text-center space-y-4 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Shield className="w-4 h-4" />
            Commit-Reveal Voting
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            How the Election Works
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            trustlessVote uses a commit-reveal voting mechanism to ensure your vote 
            remains private until counting begins, while maintaining complete transparency.
          </p>
        </section>

        {/* Process Steps */}
        <section className="space-y-6">
          {steps.map((step, index) => (
            <div 
              key={step.phase}
              className="official-card p-6 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mt-3" />
                  )}
                </div>
                
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Phase {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-foreground">{step.phase}</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Why It Works */}
        <section className="secure-zone p-8 animate-fade-up">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Why Commit-Reveal?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Privacy During Voting</h3>
                <p className="text-sm text-muted-foreground">
                  During the commit phase, no one can see how you voted—not even election 
                  administrators. Your vote is encrypted with a secret only you know.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Preventing Manipulation</h3>
                <p className="text-sm text-muted-foreground">
                  Since votes are hidden until reveal, no one can change their vote based 
                  on others' choices. This prevents last-minute strategic voting.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Verifiable Integrity</h3>
                <p className="text-sm text-muted-foreground">
                  When you reveal, the system proves your vote matches your original 
                  commitment. Any mismatch is cryptographically detectable.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Transparent Counting</h3>
                <p className="text-sm text-muted-foreground">
                  All revealed votes are public and countable by anyone. The final 
                  result can be independently verified by any observer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 animate-fade-up">
          <p className="text-muted-foreground">
            Ready to participate in secure, transparent democracy?
          </p>
          <Button variant="official" size="lg" asChild>
            <Link to="/vote">
              Cast Your Vote
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </section>
      </div>
    </Layout>
  );
}
