import { Candidate, ElectionState, Voter, PhaseInfo, ElectionPhase } from '@/types/election';

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    party: 'Progressive Alliance',
    symbol: '🌿',
    photo: '/placeholder.svg',
    bio: 'Former city council member with 12 years of public service experience. Advocate for sustainable development and community-driven governance.',
    manifesto: {
      vision: 'Building a transparent and inclusive democracy where every citizen has a voice in shaping our collective future through technology and civic engagement.',
      policies: [
        'Implement blockchain-based public records for complete transparency',
        'Establish community councils with direct voting rights',
        'Create digital infrastructure for civic participation',
        'Promote sustainable urban development initiatives'
      ],
      promises: [
        'Monthly public town halls with real-time voting',
        'Open-source all government software within 2 years',
        'Reduce bureaucratic processing time by 50%'
      ]
    },
    votes: 1247
  },
  {
    id: '2',
    name: 'Marcus Chen',
    party: 'Unity Coalition',
    symbol: '⭐',
    photo: '/placeholder.svg',
    bio: 'Technology entrepreneur and education reformer. Founded three successful civic tech startups focused on governmental efficiency.',
    manifesto: {
      vision: 'Modernizing governance through innovation while preserving democratic values and ensuring no citizen is left behind in the digital transition.',
      policies: [
        'Universal digital literacy programs for all age groups',
        'Smart city initiatives with privacy-first approach',
        'Decentralized public services for rural areas',
        'Youth engagement through gamified civic education'
      ],
      promises: [
        'Free digital skills training for 100,000 citizens',
        'Launch mobile voting pilot within first year',
        'Create 5,000 tech jobs in public sector'
      ]
    },
    votes: 1089
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    party: 'Democratic Front',
    symbol: '🔷',
    photo: '/placeholder.svg',
    bio: 'Civil rights attorney and grassroots organizer. Led successful campaigns for voting rights expansion across three states.',
    manifesto: {
      vision: 'Ensuring every vote counts and every voice is heard through secure, accessible, and verifiable democratic processes for all citizens.',
      policies: [
        'Universal voter registration at age 18',
        'Multilingual voting support and accessibility',
        'Independent election security audits',
        'Campaign finance transparency reforms'
      ],
      promises: [
        'Double voter participation in local elections',
        'End-to-end encryption for all voting systems',
        'Public real-time election monitoring dashboards'
      ]
    },
    votes: 934
  }
];

export const mockElectionState: ElectionState = {
  currentPhase: 'commit',
  electionName: '2024 General Election',
  startDate: '2024-11-01',
  endDate: '2024-11-08',
  totalRegistered: 15234,
  totalApproved: 14892,
  totalCommitted: 8745,
  totalRevealed: 0
};

export const mockVoters: Voter[] = [
  {
    id: '1',
    walletAddress: '0x1234...5678',
    name: 'John Smith',
    registeredAt: '2024-10-28T10:30:00Z',
    status: 'approved',
    approvedAt: '2024-10-29T14:00:00Z'
  },
  {
    id: '2',
    walletAddress: '0x8765...4321',
    name: 'Maria Garcia',
    registeredAt: '2024-10-28T11:45:00Z',
    status: 'pending'
  },
  {
    id: '3',
    walletAddress: '0xabcd...efgh',
    name: 'David Lee',
    registeredAt: '2024-10-28T09:15:00Z',
    status: 'committed',
    approvedAt: '2024-10-29T10:00:00Z',
    committedAt: '2024-11-02T16:30:00Z'
  }
];

// Hardcoded demo voter for login and dashboard
export const demoVoter: Voter & { email: string } = {
  id: 'demo-1',
  name: 'Alex Patel',
  email: 'voter@trustless.vote',
  walletAddress: '0xd3m0...v073',
  registeredAt: '2024-10-20T09:00:00Z',
  status: 'approved',
  approvedAt: '2024-10-21T12:15:00Z',
};

export type ElectionTimelineStatus = 'upcoming' | 'ongoing' | 'past';

export interface ElectionSummary {
  id: string;
  name: string;
  currentPhase: ElectionPhase;
  phaseStart: string; // ISO date/time
  phaseEnd: string;   // ISO date/time
  timelineStatus: ElectionTimelineStatus;
}

export const mockElections: ElectionSummary[] = [
  {
    id: 'el-2026-gen',
    name: '2026 General Election',
    currentPhase: 'registration',
    phaseStart: '2026-02-01T00:00:00Z',
    phaseEnd: '2026-02-10T23:59:59Z',
    timelineStatus: 'upcoming',
  },
  {
    id: 'el-2025-local',
    name: '2025 Local Council Election',
    currentPhase: 'commit',
    phaseStart: '2025-12-01T00:00:00Z',
    phaseEnd: '2025-12-05T23:59:59Z',
    timelineStatus: 'ongoing',
  },
  {
    id: 'el-2024-gen',
    name: '2024 General Election',
    currentPhase: 'results',
    phaseStart: '2024-11-06T00:00:00Z',
    phaseEnd: '2024-11-08T18:00:00Z',
    timelineStatus: 'past',
  },
];

export const getPhases = (currentPhase: ElectionPhase): PhaseInfo[] => {
  const phases: ElectionPhase[] = ['registration', 'approval', 'commit', 'reveal', 'results'];
  const currentIndex = phases.indexOf(currentPhase);

  return [
    {
      id: 'registration',
      label: 'Registration',
      description: 'Voters submit registration requests',
      status: currentIndex > 0 ? 'completed' : currentIndex === 0 ? 'active' : 'upcoming'
    },
    {
      id: 'approval',
      label: 'Approval',
      description: 'Admin reviews and approves voters',
      status: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'active' : 'upcoming'
    },
    {
      id: 'commit',
      label: 'Commit Vote',
      description: 'Cast encrypted votes on-chain',
      status: currentIndex > 2 ? 'completed' : currentIndex === 2 ? 'active' : 'upcoming'
    },
    {
      id: 'reveal',
      label: 'Reveal Vote',
      description: 'Reveal and verify your vote',
      status: currentIndex > 3 ? 'completed' : currentIndex === 3 ? 'active' : 'upcoming'
    },
    {
      id: 'results',
      label: 'Results',
      description: 'Official results declaration',
      status: currentIndex >= 4 ? 'completed' : 'upcoming'
    }
  ];
};
