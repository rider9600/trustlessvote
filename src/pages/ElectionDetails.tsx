import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Users,
  Vote,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getElectionWithPhases } from "@/services/elections.service";
import { getCandidatesWithManifestos } from "@/services/candidates.service";
import {
  addVoterToElection,
  getVotersWithProfiles,
} from "@/services/voters.service";
import { searchProfiles } from "@/services/auth.service";
import {
  ElectionWithPhases,
  CandidateWithManifesto,
  VoterWithProfile,
  Profile,
} from "@/types/supabase";

function deriveStatusFromPhases(
  election: ElectionWithPhases
): "upcoming" | "ongoing" | "completed" {
  const phases = election.phases || [];
  if (!phases.length) {
    return election.status as "upcoming" | "ongoing" | "completed";
  }

  const now = new Date();
  const startTimes = phases.map((p) => new Date(p.start_time).getTime());
  const endTimes = phases.map((p) => new Date(p.end_time).getTime());

  const earliestStart = new Date(Math.min(...startTimes));
  const latestEnd = new Date(Math.max(...endTimes));

  if (now < earliestStart) return "upcoming";
  if (now > latestEnd) return "completed";
  return "ongoing";
}

export default function ElectionDetails() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<ElectionWithPhases | null>(null);
  const [candidates, setCandidates] = useState<CandidateWithManifesto[]>([]);
  const [voters, setVoters] = useState<VoterWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [voterSearchTerm, setVoterSearchTerm] = useState("");
  const [voterSearchResults, setVoterSearchResults] = useState<Profile[]>([]);
  const [isSearchingVoters, setIsSearchingVoters] = useState(false);
  const [addingVoterId, setAddingVoterId] = useState<string | null>(null);
  // Blockchain contract features removed

  useEffect(() => {
    if (electionId) {
      loadElectionData();
    }
  }, [electionId]);

  const loadElectionData = async () => {
    try {
      setIsLoading(true);

      if (!electionId) return;

      // Load election with phases
      const electionData = await getElectionWithPhases(electionId);
      if (!electionData) {
        toast.error("Election not found");
        return;
      }
      setElection(electionData);

      // Load candidates with manifestos
      const candidatesData = await getCandidatesWithManifestos(electionId);
      setCandidates(candidatesData);

      // Load voters with profiles
      const votersData = await getVotersWithProfiles(electionId);

      setVoters(votersData);
    } catch (error: any) {
      console.error("Error loading election data:", error);
      toast.error("Failed to load election details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchVoters = async () => {
    if (!electionId) return;

    const term = voterSearchTerm.trim();
    if (!term) {
      setVoterSearchResults([]);
      return;
    }

    try {
      setIsSearchingVoters(true);
      // Allow both voter and admin profiles to be added as eligible voters
      const profiles = await searchProfiles(term);
      const alreadyAssignedIds = new Set(
        voters.map((v) => v.voter_id).filter((id): id is string => !!id)
      );

      setVoterSearchResults(
        profiles.filter((p) => !alreadyAssignedIds.has(p.id))
      );
    } catch (error: any) {
      console.error("Error searching voters:", error);
      toast.error("Failed to search voters");
    } finally {
      setIsSearchingVoters(false);
    }
  };

  const handleAddVoter = async (profile: Profile) => {
    if (!electionId) return;

    try {
      setAddingVoterId(profile.id);
      await addVoterToElection(electionId, profile.id, true);
      toast.success("Voter added to election");
      // Refresh voters list
      const updated = await getVotersWithProfiles(electionId);
      setVoters(updated);
      // Remove from search results
      setVoterSearchResults((prev) => prev.filter((p) => p.id !== profile.id));
    } catch (error: any) {
      console.error("Error adding voter:", error);
      toast.error(error.message || "Failed to add voter");
    } finally {
      setAddingVoterId(null);
    }
  };

  // Auto-search as the admin types a name (simple debounce)
  useEffect(() => {
    if (!voterSearchTerm.trim()) {
      setVoterSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      handleSearchVoters();
    }, 300);

    return () => clearTimeout(timeout);
  }, [voterSearchTerm]);

  if (isLoading) {
    return (
      <Layout showStepper={false} currentPhase="registration" isAdmin>
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading election details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!election) {
    return (
      <Layout showStepper={false} currentPhase="registration" isAdmin>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Election Not Found
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const statusConfig = {
    upcoming: {
      bg: "bg-warning/10",
      text: "text-warning",
      label: "Upcoming",
      icon: Calendar,
    },
    ongoing: {
      bg: "bg-accent/10",
      text: "text-accent",
      label: "Ongoing",
      icon: Clock,
    },
    completed: {
      bg: "bg-success/10",
      text: "text-success",
      label: "Completed",
      icon: CheckCircle2,
    },
  };

  const derivedStatus = deriveStatusFromPhases(election);
  const config = statusConfig[derivedStatus];
  const StatusIcon = config.icon;

  const activePhase = election.phases.find((p) => p.is_active);

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <section className="flex items-center gap-4 animate-fade-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground">
                {election.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${config.bg} ${config.text}`}
              >
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              {election.description || "No description provided"}
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section
          className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="official-card p-4 text-center">
            <Users className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {voters.length}
            </p>
            <p className="text-sm text-muted-foreground">Voters</p>
          </div>
          <div className="official-card p-4 text-center">
            <Vote className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {candidates.length}
            </p>
            <p className="text-sm text-muted-foreground">Candidates</p>
          </div>
          <div className="official-card p-4 text-center">
            <CheckCircle2 className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground capitalize">
              {activePhase?.phase || "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">Current Phase</p>
          </div>
          <div className="official-card p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-bold text-foreground">
              {new Date(election.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">Created Date</p>
          </div>
        </section>

        {/* Contract address display removed */}

        {/* Winner Card (if completed) */}
        {election.status === "completed" && candidates.length > 0 && (
          <section
            className="official-card p-6 border-2 border-success animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-success" />
              <h2 className="text-xl font-semibold text-foreground">
                Election Winner
              </h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center">
                <span className="text-4xl">{candidates[0].symbol || "👤"}</span>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground">
                  {candidates[0].name}
                </h3>
                <p className="text-muted-foreground mb-3">
                  {candidates[0].party_name}
                </p>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-3xl font-bold text-success">TBD</p>
                    <p className="text-sm text-muted-foreground">Total Votes</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <p className="text-3xl font-bold text-foreground">TBD</p>
                    <p className="text-sm text-muted-foreground">Vote Share</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <section
          className="animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <Tabs defaultValue="candidates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="candidates">
                Candidates ({candidates.length})
              </TabsTrigger>
              <TabsTrigger value="voters">Voters ({voters.length})</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="candidates" className="space-y-4 mt-6">
              {candidates.length === 0 ? (
                <div className="official-card p-8 text-center">
                  <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No candidates added yet
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="official-card p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-3xl">
                          {candidate.symbol || "👤"}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {candidate.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {candidate.party_name}
                          </p>
                          {candidate.biography && (
                            <p className="text-sm text-muted-foreground">
                              {candidate.biography}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="voters" className="space-y-4 mt-6">
              {/* Search and add voters by name/email */}
              <div className="official-card p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Add voters to this election
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Search verified voter profiles by name or email and assign
                      them to this election.
                    </p>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Search voters (name or email)"
                      value={voterSearchTerm}
                      onChange={(e) => setVoterSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {voterSearchResults.length > 0 && (
                  <div className="space-y-2">
                    {voterSearchResults.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {profile.full_name}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleAddVoter(profile)}
                          disabled={addingVoterId === profile.id}
                        >
                          {addingVoterId === profile.id
                            ? "Adding..."
                            : "Add to election"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {voterSearchResults.length === 0 && !isSearchingVoters && (
                  <p className="text-xs text-muted-foreground">
                    No search results yet. Start by entering a name or email.
                  </p>
                )}
              </div>

              {/* Existing voters list */}
              {voters.length === 0 ? (
                <div className="official-card p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No voters registered yet
                  </p>
                </div>
              ) : (
                <div className="official-card p-6">
                  <div className="space-y-3">
                    {voters.map((voter) => (
                      <div
                        key={voter.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {voter.profile?.full_name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {voter.profile?.email || "No email"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {voter.is_eligible && (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          )}
                          {voter.has_committed && (
                            <Eye className="w-4 h-4 text-accent" />
                          )}
                          {voter.has_revealed && (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          )}
                          <span className="text-sm capitalize text-muted-foreground">
                            {voter.has_revealed
                              ? "Revealed"
                              : voter.has_committed
                              ? "Committed"
                              : "Eligible"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <div className="official-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground mb-4">
                  Election Timeline
                </h3>

                <div className="space-y-3">
                  {election.phases && election.phases.length > 0 ? (
                    election.phases.map((phase) => (
                      <div
                        key={phase.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {phase.phase} Phase
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {phase.is_active ? "Currently active" : "Scheduled"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {new Date(phase.start_time).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            to {new Date(phase.end_time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No phases configured
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
}
