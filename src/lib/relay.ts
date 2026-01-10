const RELAY_URL = import.meta.env.VITE_RELAY_URL as string | undefined;
const RELAY_API_KEY = import.meta.env.VITE_RELAY_API_KEY as string | undefined;

async function post(path: string, body: any) {
  if (!RELAY_URL) throw new Error('VITE_RELAY_URL not set');
  const res = await fetch(`${RELAY_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(RELAY_API_KEY ? { 'X-API-Key': RELAY_API_KEY } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Relay error (${res.status}): ${t}`);
  }
  return res.json();
}

export const relay = {
  ensureDeployed: async () => {
    const res = await fetch(`${RELAY_URL}/admin/contract`, {
      headers: RELAY_API_KEY ? { 'X-API-Key': RELAY_API_KEY } : undefined,
    });
    const json = await res.json();
    if (!json?.address) {
      const deployed = await post('/admin/deploy', {});
      return deployed.address as string;
    }
    return json.address as string;
  },
  createElection: (electionId: string) => post('/admin/create-election', { electionId }),
  addVotersByProfiles: (electionId: string, profileIds: string[]) => post('/admin/add-voters', { electionId, profileIds }),
  setPhase: (electionId: string, phase: number) => post('/admin/set-phase', { electionId, phase }),
  commit: (electionId: string, profileId: string, commitment?: string, candidateId?: string, secret?: string) =>
    post('/vote/commit', { electionId, profileId, commitment, candidateId, secret }),
  reveal: (electionId: string, profileId: string, candidateId: string, secret: string) =>
    post('/vote/reveal', { electionId, profileId, candidateId, secret }),
};
