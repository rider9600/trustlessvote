import { Shield, Check, Clock, X, Lock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoterStatus } from '@/types/election';

interface VoterStatusCardProps {
  status: VoterStatus;
  walletAddress: string;
  className?: string;
}

const statusConfig: Record<VoterStatus, {
  icon: typeof Shield;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  unregistered: {
    icon: Shield,
    label: 'Not Registered',
    description: 'Complete registration to participate',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted'
  },
  pending: {
    icon: Clock,
    label: 'Pending Approval',
    description: 'Your registration is under review',
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  approved: {
    icon: Check,
    label: 'Approved Voter',
    description: 'You are eligible to vote',
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  rejected: {
    icon: X,
    label: 'Registration Rejected',
    description: 'Contact support for assistance',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  committed: {
    icon: Lock,
    label: 'Vote Committed',
    description: 'Your encrypted vote is on-chain',
    color: 'text-accent',
    bgColor: 'bg-accent/10'
  },
  revealed: {
    icon: Eye,
    label: 'Vote Revealed',
    description: 'Your vote has been counted',
    color: 'text-success',
    bgColor: 'bg-success/10'
  }
};

export function VoterStatusCard({ status, walletAddress, className }: VoterStatusCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("official-card p-4", className)}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          config.bgColor
        )}>
          <Icon className={cn("w-6 h-6", config.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{config.label}</h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              config.bgColor,
              config.color
            )}>
              {status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {config.description}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Wallet</p>
          <p className="text-sm font-mono text-foreground">{walletAddress}</p>
        </div>
      </div>
    </div>
  );
}
