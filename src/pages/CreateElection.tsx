import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, X, Calendar, Users, Vote, ArrowLeft, Upload, Save
} from 'lucide-react';
import { AddVoterForm, AddCandidateForm, CreateElectionForm } from '@/types/admin';
import { Voter, Candidate } from '@/types/election';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CreateElection() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'details' | 'voters' | 'candidates'>('details');
  
  // Election details
  const [electionDetails, setElectionDetails] = useState<CreateElectionForm>({
    name: '',
    description: '',
    commitPhaseStart: '',
    commitPhaseEnd: '',
    revealPhaseStart: '',
    revealPhaseEnd: '',
  });

  // Voters
  const [voters, setVoters] = useState<AddVoterForm[]>([]);
  const [newVoter, setNewVoter] = useState<AddVoterForm>({
    name: '',
    email: '',
    walletAddress: '',
  });

  // Candidates
  const [candidates, setCandidates] = useState<AddCandidateForm[]>([]);
  const [newCandidate, setNewCandidate] = useState<AddCandidateForm>({
    name: '',
    party: '',
    symbol: '',
    partyLogo: '',
    bio: '',
    vision: '',
    policies: [''],
    promises: [''],
  });

  const handleAddVoter = () => {
    if (newVoter.name && newVoter.email && newVoter.walletAddress) {
      setVoters([...voters, newVoter]);
      setNewVoter({ name: '', email: '', walletAddress: '' });
    }
  };

  const handleRemoveVoter = (index: number) => {
    setVoters(voters.filter((_, i) => i !== index));
  };

  const handleAddCandidate = () => {
    if (newCandidate.name && newCandidate.party) {
      setCandidates([...candidates, newCandidate]);
      setNewCandidate({
        name: '',
        party: '',
        symbol: '',
        partyLogo: '',
        bio: '',
        vision: '',
        policies: [''],
        promises: [''],
      });
    }
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleCreateElection = () => {
    // Store in localStorage (simulating backend)
    const electionId = Date.now().toString();
    
    // Convert form voters to proper Voter type
    const formattedVoters = voters.map((voter, index) => ({
      id: `voter-${electionId}-${index}`,
      name: voter.name,
      email: voter.email,
      walletAddress: voter.walletAddress,
      registeredAt: new Date().toISOString(),
      status: 'pending' as const,
    }));

    // Convert form candidates to proper Candidate type
    const formattedCandidates = candidates.map((candidate, index) => ({
      id: `candidate-${electionId}-${index}`,
      name: candidate.name,
      party: candidate.party,
      symbol: candidate.symbol,
      photo: candidate.partyLogo || '/placeholder.svg',
      bio: candidate.bio,
      manifesto: {
        vision: candidate.vision,
        policies: candidate.policies.filter(p => p.trim() !== ''),
        promises: candidate.promises.filter(p => p.trim() !== ''),
      },
    }));

    const newElection = {
      id: electionId,
      ...electionDetails,
      voters: formattedVoters,
      candidates: formattedCandidates,
      status: 'upcoming' as const,
      createdAt: new Date().toISOString(),
      createdBy: 'admin@trustlessvote.com',
      currentPhase: 'registration' as const,
    };

    const existingElections = JSON.parse(localStorage.getItem('elections') || '[]');
    localStorage.setItem('elections', JSON.stringify([...existingElections, newElection]));
    
    navigate('/admin/dashboard');
  };

  return (
    <Layout showStepper={false} currentPhase="registration" isAdmin>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <section className="flex items-center gap-4 animate-fade-up">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Create New Election</h1>
            <p className="text-muted-foreground mt-1">
              Set up election details, add voters and candidates
            </p>
          </div>
        </section>

        {/* Progress Steps */}
        <section className="official-card p-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            {[
              { id: 'details', label: 'Election Details', icon: Calendar },
              { id: 'voters', label: 'Add Voters', icon: Users },
              { id: 'candidates', label: 'Add Candidates', icon: Vote }
            ].map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id as typeof currentStep)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
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
        {currentStep === 'details' && (
          <section className="official-card p-6 space-y-6 animate-fade-up">
            <h2 className="text-xl font-semibold text-foreground">Election Information</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Election Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., 2026 General Election"
                  value={electionDetails.name}
                  onChange={(e) => setElectionDetails({ ...electionDetails, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the election..."
                  value={electionDetails.description}
                  onChange={(e) => setElectionDetails({ ...electionDetails, description: e.target.value })}
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
                    onChange={(e) => setElectionDetails({ ...electionDetails, commitPhaseStart: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commitEnd">Commit Phase End *</Label>
                  <Input
                    id="commitEnd"
                    type="datetime-local"
                    value={electionDetails.commitPhaseEnd}
                    onChange={(e) => setElectionDetails({ ...electionDetails, commitPhaseEnd: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revealStart">Reveal Phase Start *</Label>
                  <Input
                    id="revealStart"
                    type="datetime-local"
                    value={electionDetails.revealPhaseStart}
                    onChange={(e) => setElectionDetails({ ...electionDetails, revealPhaseStart: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revealEnd">Reveal Phase End *</Label>
                  <Input
                    id="revealEnd"
                    type="datetime-local"
                    value={electionDetails.revealPhaseEnd}
                    onChange={(e) => setElectionDetails({ ...electionDetails, revealPhaseEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="official" onClick={() => setCurrentStep('voters')}>
                Next: Add Voters
              </Button>
            </div>
          </section>
        )}

        {/* Add Voters Form */}
        {currentStep === 'voters' && (
          <section className="space-y-6 animate-fade-up">
            <div className="official-card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Add Eligible Voters</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voterName">Voter Name</Label>
                  <Input
                    id="voterName"
                    placeholder="John Doe"
                    value={newVoter.name}
                    onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voterEmail">Email</Label>
                  <Input
                    id="voterEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={newVoter.email}
                    onChange={(e) => setNewVoter({ ...newVoter, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voterWallet">Wallet Address</Label>
                  <Input
                    id="voterWallet"
                    placeholder="0x..."
                    value={newVoter.walletAddress}
                    onChange={(e) => setNewVoter({ ...newVoter, walletAddress: e.target.value })}
                  />
                </div>
              </div>

              <Button variant="outline" onClick={handleAddVoter} className="w-full">
                <Plus className="w-4 h-4" />
                Add Voter
              </Button>
            </div>

            {voters.length > 0 && (
              <div className="official-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Added Voters ({voters.length})</h3>
                <div className="space-y-2">
                  {voters.map((voter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{voter.name}</p>
                        <p className="text-sm text-muted-foreground">{voter.email} • {voter.walletAddress}</p>
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
              <Button variant="outline" onClick={() => setCurrentStep('details')}>
                Back
              </Button>
              <Button variant="official" onClick={() => setCurrentStep('candidates')}>
                Next: Add Candidates
              </Button>
            </div>
          </section>
        )}

        {/* Add Candidates Form */}
        {currentStep === 'candidates' && (
          <section className="space-y-6 animate-fade-up">
            <div className="official-card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Add Candidates</h2>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="manifesto">Manifesto</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidateName">Candidate Name *</Label>
                      <Input
                        id="candidateName"
                        placeholder="Sarah Mitchell"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="party">Party Name *</Label>
                      <Input
                        id="party"
                        placeholder="Progressive Alliance"
                        value={newCandidate.party}
                        onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="symbol">Party Symbol</Label>
                      <Input
                        id="symbol"
                        placeholder="🌿 or emoji"
                        value={newCandidate.symbol}
                        onChange={(e) => setNewCandidate({ ...newCandidate, symbol: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo">Party Logo URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="logo"
                          placeholder="https://example.com/logo.png"
                          value={newCandidate.partyLogo}
                          onChange={(e) => setNewCandidate({ ...newCandidate, partyLogo: e.target.value })}
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
                      onChange={(e) => setNewCandidate({ ...newCandidate, bio: e.target.value })}
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
                      onChange={(e) => setNewCandidate({ ...newCandidate, vision: e.target.value })}
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
                            setNewCandidate({ ...newCandidate, policies: newPolicies });
                          }}
                        />
                        {index === newCandidate.policies.length - 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setNewCandidate({ 
                              ...newCandidate, 
                              policies: [...newCandidate.policies, ''] 
                            })}
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
                            setNewCandidate({ ...newCandidate, promises: newPromises });
                          }}
                        />
                        {index === newCandidate.promises.length - 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setNewCandidate({ 
                              ...newCandidate, 
                              promises: [...newCandidate.promises, ''] 
                            })}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <Button variant="outline" onClick={handleAddCandidate} className="w-full">
                <Plus className="w-4 h-4" />
                Add Candidate
              </Button>
            </div>

            {candidates.length > 0 && (
              <div className="official-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Added Candidates ({candidates.length})</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {candidates.map((candidate, index) => (
                    <div key={index} className="candidate-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{candidate.symbol || '👤'}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">{candidate.party}</p>
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
              <Button variant="outline" onClick={() => setCurrentStep('voters')}>
                Back
              </Button>
              <Button 
                variant="vote" 
                size="lg"
                onClick={handleCreateElection}
                disabled={!electionDetails.name || voters.length === 0 || candidates.length === 0}
              >
                <Save className="w-4 h-4" />
                Create Election
              </Button>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
