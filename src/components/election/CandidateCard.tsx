import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Candidate } from '@/types/election';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showVoteButton?: boolean;
  showVotes?: boolean;
  compact?: boolean;
}

export function CandidateCard({
  candidate,
  isSelected = false,
  onSelect,
  showVoteButton = false,
  showVotes = false,
  compact = false
}: CandidateCardProps) {
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <div
      className={cn(
        "candidate-card group",
        isSelected && "selected",
        compact && "p-4"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Photo */}
        <div className="relative">
          <div className={cn(
            "rounded-xl overflow-hidden bg-muted flex items-center justify-center",
            compact ? "w-16 h-16" : "w-20 h-20"
          )}>
            <span className="text-3xl">{candidate.symbol}</span>
          </div>
          {isSelected && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-accent-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-foreground",
            compact ? "text-base" : "text-lg"
          )}>
            {candidate.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
            <span>{candidate.symbol}</span>
            <span>{candidate.party}</span>
          </p>
          {!compact && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {candidate.bio}
            </p>
          )}
          
          {showVotes && candidate.votes !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${(candidate.votes / 3270) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground min-w-[60px] text-right">
                {candidate.votes.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2">
          {showVoteButton && onSelect && (
            <Button
              variant={isSelected ? "vote" : "outline"}
              size="sm"
              onClick={() => onSelect(candidate.id)}
              className="min-w-[100px]"
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4" />
                  Selected
                </>
              ) : (
                'Select'
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManifesto(!showManifesto)}
            className="text-muted-foreground"
          >
            <FileText className="w-4 h-4 mr-1" />
            Manifesto
            {showManifesto ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Manifesto Accordion */}
      {showManifesto && (
        <div className="mt-6 pt-6 border-t border-border animate-fade-up">
          <div className="space-y-6">
            {/* Vision */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                Vision
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {candidate.manifesto.vision}
              </p>
            </div>

            {/* Policies */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-phase-active rounded-full" />
                Key Policies
              </h4>
              <ul className="space-y-2">
                {candidate.manifesto.policies.map((policy, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-muted-foreground mt-1">•</span>
                    {policy}
                  </li>
                ))}
              </ul>
            </div>

            {/* Promises */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                Campaign Promises
              </h4>
              <ul className="space-y-2">
                {candidate.manifesto.promises.map((promise, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    {promise}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
