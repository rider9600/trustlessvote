import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  // props kept for compatibility but currently unused
  isAdmin?: boolean;
  isConnected?: boolean;
  walletAddress?: string;
  minimal?: boolean;
}

export function Navigation({ isAdmin, minimal }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginRoute = location.pathname === '/login';
  const isRootRoute = location.pathname === '/';
  const effectiveIsAdmin = typeof isAdmin === 'boolean' ? isAdmin : location.pathname.startsWith('/admin');

  const showControls = !minimal && !isLoginRoute;
  const showBack = showControls && !isRootRoute;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(effectiveIsAdmin ? '/admin/dashboard' : '/voter');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Go back"
                onClick={handleBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground">trustlessVote</span>
            </Link>
          </div>

          {showControls && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{effectiveIsAdmin ? 'Admin' : 'Voter'} session</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
