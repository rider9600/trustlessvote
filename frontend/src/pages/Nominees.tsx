import { Layout } from '@/components/layout/Layout';
import { CandidateCard } from '@/components/election/CandidateCard';
import { mockCandidates } from '@/data/mockData';
import { Users } from 'lucide-react';

export default function NomineesPage() {
  return (
    <Layout currentPhase="commit">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center space-y-4 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Users className="w-4 h-4" />
            Official Candidates
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Meet the Nominees
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get to know the candidates running in this election. Review their backgrounds, 
            read their manifestos, and make an informed decision.
          </p>
        </section>

        {/* Candidates List */}
        <section className="space-y-6">
          {mockCandidates.map((candidate, index) => (
            <div 
              key={candidate.id} 
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CandidateCard candidate={candidate} />
            </div>
          ))}
        </section>

        {/* Information Notice */}
        <section className="official-card p-6 text-center animate-fade-up">
          <p className="text-sm text-muted-foreground">
            All candidate information is verified and approved by the election commission. 
            Manifesto content is provided by the candidates themselves.
          </p>
        </section>
      </div>
    </Layout>
  );
}
