import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhaseInfo } from '@/types/election';

interface ElectionStepperProps {
  phases: PhaseInfo[];
}

export function ElectionStepper({ phases }: ElectionStepperProps) {
  return (
    <div className="w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {phases.map((phase, index) => (
            <div key={phase.id} className="flex items-center flex-1">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    phase.status === 'completed' && "bg-success text-success-foreground",
                    phase.status === 'active' && "bg-phase-active text-white ring-4 ring-phase-active/20 animate-pulse-subtle",
                    phase.status === 'upcoming' && "bg-muted text-muted-foreground border-2 border-muted-foreground/30"
                  )}
                >
                  {phase.status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      phase.status === 'active' && "text-phase-active",
                      phase.status === 'completed' && "text-success",
                      phase.status === 'upcoming' && "text-muted-foreground"
                    )}
                  >
                    {phase.label}
                  </p>
                  <p className="text-xs text-muted-foreground hidden md:block mt-0.5">
                    {phase.description}
                  </p>
                </div>
              </div>
              
              {/* Connector line */}
              {index < phases.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-3 mt-[-24px] transition-colors duration-300",
                    phase.status === 'completed' && "bg-success",
                    phase.status === 'active' && "bg-gradient-to-r from-phase-active to-muted",
                    phase.status === 'upcoming' && "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
