import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface NavigationProps {
  // props kept for compatibility but currently unused
  isAdmin?: boolean;
  isConnected?: boolean;
  walletAddress?: string;
  minimal?: boolean;
}

export function Navigation({}: NavigationProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-start h-16">
          {/* Logo only */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">trustlessVote</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
