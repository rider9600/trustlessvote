import { Shield, Lock, Eye, Trophy, UserCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ElectionPhase } from '@/types/election';

interface PhaseIndicatorProps {
  phase: ElectionPhase;
  className?: string;
}

const phaseConfig = {
  registration: {
    icon: UserCheck,
    label: 'Registration Open',
    description: 'Submit your voter registration',
    color: 'bg-phase-active text-white'
  },
  approval: {
    icon: Clock,
    label: 'Approval in Progress',
    description: 'Awaiting admin verification',
    color: 'bg-warning text-warning-foreground'
  },
  commit: {
    icon: Lock,
    label: 'Voting Open - Commit Phase',
    description: 'Cast your encrypted vote',
    color: 'bg-accent text-accent-foreground'
  },
  reveal: {
    icon: Eye,
    label: 'Reveal Phase',
    description: 'Reveal and verify your vote',
    color: 'bg-success text-success-foreground'
  },
  results: {
    icon: Trophy,
    label: 'Results Declared',
    description: 'Election completed',
    color: 'bg-primary text-primary-foreground'
  }
};

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-3 px-4 py-2.5 rounded-xl",
      config.color,
      className
    )}>
      <Icon className="w-5 h-5" />
      <div>
        <p className="text-sm font-semibold">{config.label}</p>
        <p className="text-xs opacity-90">{config.description}</p>
      </div>
    </div>
  );
}
