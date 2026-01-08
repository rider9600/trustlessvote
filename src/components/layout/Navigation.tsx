import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/process', label: 'Election Process' },
  { href: '/nominees', label: 'Nominees' },
  { href: '/vote', label: 'Vote' },
  { href: '/results', label: 'Results' },
];

interface NavigationProps {
  isAdmin?: boolean;
  isConnected?: boolean;
  walletAddress?: string;
}

export function Navigation({ isAdmin = false, isConnected = true, walletAddress = '0x1234...5678' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">trustlessVote</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                  location.pathname === '/admin'
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Wallet Status & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-success" : "bg-muted-foreground"
              )} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? walletAddress : 'Not Connected'}
              </span>
            </div>

            {/* User Menu Button */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="w-5 h-5" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-up">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
            
            {/* Mobile Connection Status */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 px-4">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-success" : "bg-muted-foreground"
                )} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? walletAddress : 'Wallet not connected'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
