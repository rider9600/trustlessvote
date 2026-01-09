// Seeds local Supabase (GoTrue + PostgREST) with:
// - 1 admin user
// - 19 voter users mapped to the first 19 default Hardhat accounts
//
// This script is intended to run inside docker-compose.

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://proxy:8000';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('[seed] Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(url, label, tries = 60) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok || res.status === 404) {
        console.log(`[seed] ${label} reachable (${res.status})`);
        return;
      }
    } catch {
      // ignore
    }
    await sleep(1000);
  }
  throw new Error(`[seed] Timed out waiting for ${label}: ${url}`);
}

function headers() {
  return {
    apikey: SERVICE_ROLE_KEY,
    authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    'content-type': 'application/json',
  };
}

async function adminCreateUser({ email, password, email_confirm = true }) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password, email_confirm }),
  });

  if (!res.ok) {
    const text = await res.text();
    // If user already exists, we can try to fetch by email via list endpoint.
    if (text.toLowerCase().includes('already') || res.status === 400 || res.status === 409) {
      console.log(`[seed] User may already exist: ${email} (${res.status})`);
      return await adminFindUserByEmail(email);
    }
    throw new Error(`[seed] Create user failed (${email}): ${res.status} ${text}`);
  }

  const data = await res.json();
  return data;
}

async function adminFindUserByEmail(email) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { method: 'GET', headers: headers() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[seed] Find user failed (${email}): ${res.status} ${text}`);
  }
  const data = await res.json();

  // GoTrue may return { users: [...] } or [...] depending on version
  const users = Array.isArray(data) ? data : data.users;
  const user = users?.find?.((u) => u.email === email) || users?.[0];
  if (!user) throw new Error(`[seed] Could not find user for email ${email}`);
  return user;
}

async function upsertProfile({ id, full_name, email, role, wallet_address }) {
  const url = `${SUPABASE_URL}/rest/v1/profiles?on_conflict=email`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers(),
      prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([{ id, full_name, email, role, wallet_address }]),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[seed] Upsert profile failed (${email}): ${res.status} ${text}`);
  }

  const data = await res.json();
  return data?.[0];
}

const HARDHAT_ADDRESSES_19 = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
  '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
  '0x71bE63f3384f5fb98995898A86B02Fb2426c5788',
  '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
  '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
  '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097',
  '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
  '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
  '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
  '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
  '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
];

const NAMES_19 = [
  'Alice',
  'Bob',
  'Carol',
  'Dave',
  'Eve',
  'Frank',
  'Grace',
  'Heidi',
  'Ivan',
  'Judy',
  'Mallory',
  'Niaj',
  'Olivia',
  'Peggy',
  'Rupert',
  'Sybil',
  'Trent',
  'Victor',
  'Wendy',
];

async function main() {
  console.log('[seed] Starting...');

  await waitFor(`${SUPABASE_URL}/auth/v1/health`, 'auth');
  await waitFor(`${SUPABASE_URL}/rest/v1/`, 'rest');

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@trustlessvote.local';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123456';

  const adminUser = await adminCreateUser({ email: adminEmail, password: adminPass });
  const adminId = adminUser.id || adminUser.user?.id;
  if (!adminId) throw new Error('[seed] Could not determine admin user id');

  await upsertProfile({
    id: adminId,
    full_name: 'Admin User',
    email: adminEmail,
    role: 'admin',
    wallet_address: HARDHAT_ADDRESSES_19[0],
  });
  console.log('[seed] Admin user ready:', adminEmail);

  // 19 voters
  const voterPassword = process.env.VOTER_PASSWORD || 'voter123456';

  for (let i = 0; i < 19; i++) {
    const name = NAMES_19[i];
    const addr = HARDHAT_ADDRESSES_19[i + 1];
    const email = `voter${String(i + 1).padStart(2, '0')}@trustlessvote.local`;

    const voterUser = await adminCreateUser({ email, password: voterPassword });
    const voterId = voterUser.id || voterUser.user?.id;
    if (!voterId) throw new Error(`[seed] Could not determine voter id for ${email}`);

    await upsertProfile({
      id: voterId,
      full_name: `${name} (Voter ${i + 1})`,
      email,
      role: 'voter',
      wallet_address: addr,
    });
  }

  console.log('[seed] Seed complete: 1 admin + 19 voters');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
