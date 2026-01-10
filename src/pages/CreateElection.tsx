import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  X,
  Calendar,
  Users,
  Vote,
  ArrowLeft,
  Upload,
  Save,
  Search,
} from "lucide-react";
import { AddCandidateForm, CreateElectionForm } from "@/types/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getCurrentProfile, searchProfiles } from "@/services/auth.service";
import {
  createElection,
  createElectionPhase,
} from "@/services/elections.service";
import {
  createCandidate,
  createManifesto,
} from "@/services/candidates.service";
import { addVoterToElection } from "@/services/voters.service";
import type { Profile } from "@/types/supabase";
import { relay } from "@/lib/relay";

export default function CreateElection() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<
    "details" | "voters" | "candidates"
  >("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Election details
  const [electionDetails, setElectionDetails] = useState<CreateElectionForm>({
    name: "",
    description: "",
    commitPhaseStart: "",
    commitPhaseEnd: "",
    revealPhaseStart: "",
    revealPhaseEnd: "",
  });

  // Voters (select existing profiles by name)
  const [selectedVoters, setSelectedVoters] = useState<Profile[]>([]);
  const [voterSearchTerm, setVoterSearchTerm] = useState("");
  const [voterSearchResults, setVoterSearchResults] = useState<Profile[]>([]);
  const [isSearchingVoters, setIsSearchingVoters] = useState(false);

  // Candidates
  const [candidates, setCandidates] = useState<AddCandidateForm[]>([]);
  const [newCandidate, setNewCandidate] = useState<AddCandidateForm>({
    name: "",
    party: "",
    symbol: "",
    partyLogo: "",
    bio: "",
    vision: "",
    policies: [""],
    promises: [""],
  });

  // Candidate profile search (optional pre-fill from existing voter profiles)
  const [candidateSearchTerm, setCandidateSearchTerm] = useState("");
  const [candidateSearchResults, setCandidateSearchResults] = useState<
    Profile[]
  >([]);
  const [isSearchingCandidates, setIsSearchingCandidates] = useState(false);

  const handleRemoveVoter = (index: number) => {
    setSelectedVoters(selectedVoters.filter((_, i) => i !== index));
  };

  const handleSelectVoter = (profile: Profile) => {
    if (selectedVoters.some((v) => v.id === profile.id)) {
      return;
    }
    setSelectedVoters([...selectedVoters, profile]);
  };

  const handleSearchVoters = async () => {
    const term = voterSearchTerm.trim();
    if (!term) {
      setVoterSearchResults([]);
      return;
    }

    try {
      setIsSearchingVoters(true);
      // Allow both voter and admin profiles to be eligible voters
      const profiles = await searchProfiles(term);
      const selectedIds = new Set(selectedVoters.map((v) => v.id));
      setVoterSearchResults(profiles.filter((p) => !selectedIds.has(p.id)));
    } catch (error: any) {
      console.error("Error searching voters:", error);
      toast.error("Failed to search voters");
    } finally {
      setIsSearchingVoters(false);
    }
  };

  // Debounced auto-search while typing voter name
  useEffect(() => {
    if (!voterSearchTerm.trim()) {
      setVoterSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      handleSearchVoters();
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voterSearchTerm]);

  const handleSearchCandidates = async () => {
    const term = candidateSearchTerm.trim();
    if (!term) {
      setCandidateSearchResults([]);
      return;
    }

    try {
      setIsSearchingCandidates(true);
      // Candidates are usually registered users (voters or admins)
      const profiles = await searchProfiles(term);
      setCandidateSearchResults(profiles || []);
    } catch (error: any) {
      console.error("Error searching candidate profiles:", error);
      toast.error("Failed to search profiles for candidates");
    } finally {
      setIsSearchingCandidates(false);
    }
  };

  // Debounced auto-search while typing candidate profile name
  useEffect(() => {
    if (!candidateSearchTerm.trim()) {
      setCandidateSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      handleSearchCandidates();
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateSearchTerm]);

  const handleAddCandidate = () => {
    if (newCandidate.name && newCandidate.party) {
      setCandidates([...candidates, newCandidate]);
      setNewCandidate({
        name: "",
        party: "",
        symbol: "",
        partyLogo: "",
        bio: "",
        vision: "",
        policies: [""],
        promises: [""],
      });
    }
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleCreateElection = async () => {
    if (!electionDetails.name) {
      toast.error("Please enter election name");
      return;
    }

    if (!electionDetails.commitPhaseStart || !electionDetails.commitPhaseEnd) {
      toast.error("Please set commit phase dates");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current admin profile
      const profile = await getCurrentProfile();
      if (!profile || profile.role !== "admin") {
        toast.error("Unauthorized: Admin access required");
        return;
      }

      // 1. Create election
      const election = await createElection(
        profile.id,
        electionDetails.name,
        electionDetails.description || null,
        "upcoming"
      );

      // 2. Create election phases
      await createElectionPhase(
        election.id,
        "commit",
        electionDetails.commitPhaseStart,
        electionDetails.commitPhaseEnd,
        false
      );

      if (electionDetails.revealPhaseStart && electionDetails.revealPhaseEnd) {
        await createElectionPhase(
          election.id,
          "reveal",
          electionDetails.revealPhaseStart,
          electionDetails.revealPhaseEnd,
          false
        );
      }

      // 3. Add selected existing voters to election (Supabase)
      for (const voter of selectedVoters) {
        await addVoterToElection(election.id, voter.id, true);
      }

      // 4. Create candidates with manifestos
      for (const candidate of candidates) {
        const createdCandidate = await createCandidate(
          election.id,
          candidate.name,
          candidate.party,
          candidate.symbol || null,
          candidate.partyLogo || null,
          null, // photo_url
          candidate.bio || null
        );

        // Create manifesto for candidate
        await createManifesto(
          createdCandidate.id,
          candidate.vision || null,
          candidate.policies.filter((p) => p.trim() !== ""),
          candidate.promises.filter((p) => p.trim() !== "")
        );
      }

      // 5. On-chain: ensure contract is deployed, create election, add voters
      try {
        await relay.ensureDeployed();
        await relay.createElection(election.id);
        if (selectedVoters.length > 0) {
          await relay.addVotersByProfiles(
            election.id,
            selectedVoters.map((v) => v.id)
          );
        }
      } catch (chainErr: any) {
        console.warn(
          "On-chain actions failed (continuing):",
          chainErr?.message || chainErr
        );
      }

      toast.success("Election created successfully! On-chain sync attempted.");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Error creating election:", error);
      toast.error(error.message || "Failed to create election");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin>
      <div className="max-w-5xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-foreground">
              Create New Election
            </h1>
            <p className="text-muted-foreground mt-1">
              Set up election details, add voters and candidates
            </p>
          </div>
        </section>

        {/* Progress Steps */}
        <section
          className="official-card p-6 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center justify-between">
            {[
              { id: "details", label: "Election Details", icon: Calendar },
              { id: "voters", label: "Add Voters", icon: Users },
              { id: "candidates", label: "Add Candidates", icon: Vote },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id as typeof currentStep)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.label}</span>
                </button>
                {index < 2 && <div className="h-px flex-1 bg-border mx-2" />}
              </div>
            ))}
          </div>
        </section>

        {/* Election Details Form */}
        {currentStep === "details" && (
          <section className="official-card p-6 space-y-6 animate-fade-up">
            <h2 className="text-xl font-semibold text-foreground">
              Election Information
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Election Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., 2026 General Election"
                  value={electionDetails.name}
                  onChange={(e) =>
                    setElectionDetails({
                      ...electionDetails,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the election..."
                  value={electionDetails.description}
                  onChange={(e) =>
                    setElectionDetails({
                      ...electionDetails,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commitStart">Commit Phase Start *</Label>
                  <Input
                    id="commitStart"
                    type="datetime-local"
                    value={electionDetails.commitPhaseStart}
                    onChange={(e) =>
                      setElectionDetails({
                        ...electionDetails,
                        commitPhaseStart: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commitEnd">Commit Phase End *</Label>
                  <Input
                    id="commitEnd"
                    type="datetime-local"
                    value={electionDetails.commitPhaseEnd}
                    onChange={(e) =>
                      setElectionDetails({
                        ...electionDetails,
                        commitPhaseEnd: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revealStart">Reveal Phase Start *</Label>
                  <Input
                    id="revealStart"
                    type="datetime-local"
                    value={electionDetails.revealPhaseStart}
                    onChange={(e) =>
                      setElectionDetails({
                        ...electionDetails,
                        revealPhaseStart: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revealEnd">Reveal Phase End *</Label>
                  <Input
                    id="revealEnd"
                    type="datetime-local"
                    value={electionDetails.revealPhaseEnd}
                    onChange={(e) =>
                      setElectionDetails({
                        ...electionDetails,
                        revealPhaseEnd: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="official"
                onClick={() => setCurrentStep("voters")}
              >
                Next: Add Voters
              </Button>
            </div>
          </section>
        )}

        {/* Add Voters Form */}
        {currentStep === "voters" && (
          <section className="space-y-6 animate-fade-up">
            <div className="official-card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Search className="w-4 h-4" />
                Add Eligible Voters
              </h2>

              <p className="text-sm text-muted-foreground">
                Search existing voter profiles by full name and attach them to
                this election. Only users who have already signed up as voters
                will appear here.
              </p>

              <div className="flex flex-col md:flex-row md:items-end gap-3 pt-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="voterSearch">Voter name</Label>
                  <Input
                    id="voterSearch"
                    placeholder="Start typing a voter name..."
                    value={voterSearchTerm}
                    onChange={(e) => setVoterSearchTerm(e.target.value)}
                  />
                </div>
                <div className="md:w-40 text-xs text-muted-foreground">
                  {isSearchingVoters
                    ? "Searching…"
                    : "Showing up to 5 closest matches"}
                </div>
              </div>

              {voterSearchResults.length > 0 && (
                <div className="space-y-2 pt-2">
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
                        onClick={() => handleSelectVoter(profile)}
                      >
                        Add to list
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {voterSearchResults.length === 0 && !voterSearchTerm.trim() && (
                <p className="text-xs text-muted-foreground pt-1">
                  Begin typing to see matching voters by full name.
                </p>
              )}
            </div>

            {selectedVoters.length > 0 && (
              <div className="official-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground">
                  Added Voters ({selectedVoters.length})
                </h3>
                <div className="space-y-2">
                  {selectedVoters.map((voter, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {voter.full_name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveVoter(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("details")}
              >
                Back
              </Button>
              <Button
                variant="official"
                onClick={() => setCurrentStep("candidates")}
              >
                Next: Add Candidates
              </Button>
            </div>
          </section>
        )}

        {/* Add Candidates Form */}
        {currentStep === "candidates" && (
          <section className="space-y-6 animate-fade-up">
            <div className="official-card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Add Candidates
              </h2>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="manifesto">Manifesto</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  {/* Optional: pick candidate from existing voter profile */}
                  <div className="space-y-2">
                    <Label htmlFor="candidateProfileSearch">
                      Candidate from profiles (optional)
                    </Label>
                    <Input
                      id="candidateProfileSearch"
                      placeholder="Start typing a voter's name to pre-fill candidate details..."
                      value={candidateSearchTerm}
                      onChange={(e) => setCandidateSearchTerm(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {isSearchingCandidates
                        ? "Searching profiles..."
                        : "Showing up to 5 closest voter matches when typing."}
                    </p>

                    {candidateSearchResults.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {candidateSearchResults.map((profile) => (
                          <div
                            key={profile.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {profile.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {profile.email}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setNewCandidate({
                                  ...newCandidate,
                                  name: profile.full_name,
                                });
                                setCandidateSearchTerm("");
                                setCandidateSearchResults([]);
                              }}
                            >
                              Use as candidate
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidateName">Candidate Name *</Label>
                      <Input
                        id="candidateName"
                        placeholder="Sarah Mitchell"
                        value={newCandidate.name}
                        onChange={(e) =>
                          setNewCandidate({
                            ...newCandidate,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="party">Party Name *</Label>
                      <Input
                        id="party"
                        placeholder="Progressive Alliance"
                        value={newCandidate.party}
                        onChange={(e) =>
                          setNewCandidate({
                            ...newCandidate,
                            party: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="symbol">Party Symbol</Label>
                      <Input
                        id="symbol"
                        placeholder="🌿 or emoji"
                        value={newCandidate.symbol}
                        onChange={(e) =>
                          setNewCandidate({
                            ...newCandidate,
                            symbol: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo">Party Logo URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="logo"
                          placeholder="https://example.com/logo.png"
                          value={newCandidate.partyLogo}
                          onChange={(e) =>
                            setNewCandidate({
                              ...newCandidate,
                              partyLogo: e.target.value,
                            })
                          }
                        />
                        <Button variant="outline" size="icon">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                      id="bio"
                      placeholder="Brief background and qualifications..."
                      value={newCandidate.bio}
                      onChange={(e) =>
                        setNewCandidate({
                          ...newCandidate,
                          bio: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="manifesto" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="vision">Vision Statement</Label>
                    <Textarea
                      id="vision"
                      placeholder="Overall vision for the term..."
                      value={newCandidate.vision}
                      onChange={(e) =>
                        setNewCandidate({
                          ...newCandidate,
                          vision: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Policy Points</Label>
                    {newCandidate.policies.map((policy, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Policy ${index + 1}`}
                          value={policy}
                          onChange={(e) => {
                            const newPolicies = [...newCandidate.policies];
                            newPolicies[index] = e.target.value;
                            setNewCandidate({
                              ...newCandidate,
                              policies: newPolicies,
                            });
                          }}
                        />
                        {index === newCandidate.policies.length - 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setNewCandidate({
                                ...newCandidate,
                                policies: [...newCandidate.policies, ""],
                              })
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign Promises</Label>
                    {newCandidate.promises.map((promise, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Promise ${index + 1}`}
                          value={promise}
                          onChange={(e) => {
                            const newPromises = [...newCandidate.promises];
                            newPromises[index] = e.target.value;
                            setNewCandidate({
                              ...newCandidate,
                              promises: newPromises,
                            });
                          }}
                        />
                        {index === newCandidate.promises.length - 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setNewCandidate({
                                ...newCandidate,
                                promises: [...newCandidate.promises, ""],
                              })
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                variant="outline"
                onClick={handleAddCandidate}
                className="w-full"
              >
                <Plus className="w-4 h-4" />
                Add Candidate
              </Button>
            </div>

            {candidates.length > 0 && (
              <div className="official-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground">
                  Added Candidates ({candidates.length})
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {candidates.map((candidate, index) => (
                    <div key={index} className="candidate-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-2xl">
                              {candidate.symbol || "👤"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {candidate.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {candidate.party}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCandidate(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("voters")}
              >
                Back
              </Button>
              <Button
                variant="vote"
                size="lg"
                onClick={handleCreateElection}
                disabled={
                  !electionDetails.name ||
                  selectedVoters.length === 0 ||
                  candidates.length === 0 ||
                  isSubmitting
                }
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Creating Election..." : "Create Election"}
              </Button>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
