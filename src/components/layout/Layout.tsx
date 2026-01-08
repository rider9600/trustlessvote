import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { ElectionStepper } from './ElectionStepper';
import { getPhases } from '@/data/mockData';
import { ElectionPhase } from '@/types/election';

interface LayoutProps {
  children: ReactNode;
  showStepper?: boolean;
  currentPhase?: ElectionPhase;
  isAdmin?: boolean;
}

export function Layout({ 
  children, 
  showStepper = true, 
  currentPhase = 'commit',
  isAdmin = true 
}: LayoutProps) {
  const phases = getPhases(currentPhase);

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAdmin={isAdmin} isConnected={true} />
      {showStepper && <ElectionStepper phases={phases} />}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2024 trustlessVote</span>
              <span>•</span>
              <span>Secure. Transparent. Democratic.</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Verify on Chain
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
