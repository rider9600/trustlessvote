import Fastify from 'fastify';
import cors from 'fastify-cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { z } from 'zod';
import { loadContractAddress, saveContractAddress } from './contract.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8088);
const API_KEY = process.env.API_KEY;
const RPC_URL = process.env.HARDHAT_RPC_URL || 'http://127.0.0.1:8545';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const MNEMONIC = process.env.HARDHAT_MNEMONIC; // optional

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!API_KEY) console.warn('[relay] Warning: API_KEY is not set');
if (!ADMIN_PRIVATE_KEY) console.warn('[relay] Warning: ADMIN_PRIVATE_KEY is not set');

const provider = new ethers.JsonRpcProvider(RPC_URL);
const adminWallet = ADMIN_PRIVATE_KEY ? new ethers.Wallet(ADMIN_PRIVATE_KEY, provider) : null;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const artifactPath = path.join(__dirname, '..', 'contracts', 'TrustlessVote.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
const { abi, bytecode } = artifact;

// Fastify
const app = Fastify({ logger: true });
app.register(cors, { origin: true, methods: ['GET','POST','OPTIONS'] });

// Simple API-key auth
app.addHook('onRequest', async (req, reply) => {
  if (req.raw.url === '/health') return; // public
  const key = req.headers['x-api-key'];
  if (!API_KEY || key === API_KEY) return;
  reply.code(401);
  throw new Error('Unauthorized');
});

// Utils
function getContract(address) {
  if (!address) throw new Error('Contract address not set');
  return new ethers.Contract(address, abi, adminWallet || provider);
}

async function getVoterWalletByProfileId(profileId) {
  // Prefer deriving from mnemonic + index if available (not implemented: index mapping)
  if (supabase) {
    // Resolve assigned wallet for this profile
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('id, wallet_address')
      .eq('id', profileId)
      .single();
    if (pErr) throw pErr;
    if (!profile || !profile.wallet_address) throw new Error('No wallet assigned for profile');

    // Find corresponding private key from pool
    const { data: pool, error: wErr } = await supabase
      .from('hardhat_wallet_pool')
      .select('private_key, wallet_address')
      .eq('wallet_address', profile.wallet_address)
      .single();
    if (wErr) throw wErr;
    if (!pool || !pool.private_key) throw new Error('No private key found for wallet');

    return new ethers.Wallet(pool.private_key, provider);
  }

  throw new Error('Supabase not configured; cannot resolve voter key');
}

// Routes
app.get('/health', async () => ({ status: 'ok' }));

app.get('/admin/contract', async () => {
  const address = loadContractAddress();
  return { address };
});

app.post('/admin/deploy', async (req, reply) => {
  if (!adminWallet) throw new Error('ADMIN_PRIVATE_KEY required to deploy');
  const factory = new ethers.ContractFactory(abi, bytecode, adminWallet);
  const contract = await factory.deploy();
  const receipt = await contract.waitForDeployment();
  const address = await contract.getAddress();
  saveContractAddress(address);
  reply.code(201);
  return { address };
});

app.post('/admin/create-election', async (req) => {
  if (!adminWallet) throw new Error('ADMIN_PRIVATE_KEY required');
  const schema = z.object({ electionId: z.string().min(1) });
  const { electionId } = schema.parse(req.body);
  let address = loadContractAddress();
  if (!address) {
    // auto-deploy if missing
    const factory = new ethers.ContractFactory(abi, bytecode, adminWallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    address = await contract.getAddress();
    saveContractAddress(address);
  }
  const contract = getContract(address).connect(adminWallet);
  const tx = await contract.createElection(electionId);
  await tx.wait();
  return { ok: true, contractAddress: address };
});

app.post('/admin/add-voters', async (req) => {
  if (!adminWallet) throw new Error('ADMIN_PRIVATE_KEY required');
  const schema = z.object({
    electionId: z.string().min(1),
    profileIds: z.array(z.string()).optional(),
    addresses: z.array(z.string()).optional()
  }).refine(v => (v.profileIds && v.profileIds.length) || (v.addresses && v.addresses.length), {
    message: 'Provide profileIds or addresses'
  });
  const { electionId, profileIds, addresses } = schema.parse(req.body);

  let voterAddresses = addresses || [];
  if ((!voterAddresses || voterAddresses.length === 0) && profileIds && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_address')
      .in('id', profileIds);
    if (error) throw error;
    voterAddresses = (data || []).map(r => r.wallet_address).filter(Boolean);
  }
  if (!voterAddresses || voterAddresses.length === 0) throw new Error('No voter addresses provided/resolved');

  const contract = getContract(loadContractAddress()).connect(adminWallet);
  const tx = await contract.addVotersBatch(electionId, voterAddresses);
  await tx.wait();
  return { ok: true, added: voterAddresses.length };
});

app.post('/admin/set-phase', async (req) => {
  if (!adminWallet) throw new Error('ADMIN_PRIVATE_KEY required');
  const schema = z.object({
    electionId: z.string().min(1),
    phase: z.number().int().min(0).max(3)
  });
  const { electionId, phase } = schema.parse(req.body);
  const contract = getContract(loadContractAddress()).connect(adminWallet);
  const tx = await contract.setPhase(electionId, phase);
  await tx.wait();
  return { ok: true };
});

app.post('/vote/commit', async (req) => {
  const schema = z.object({
    electionId: z.string().min(1),
    profileId: z.string().min(1),
    commitment: z.string().optional(),
    candidateId: z.string().optional(),
    secret: z.string().optional()
  }).refine(v => v.commitment || (v.candidateId && v.secret), {
    message: 'Provide commitment or candidateId+secret'
  });
  const { electionId, profileId, commitment, candidateId, secret } = schema.parse(req.body);
  const voterWallet = await getVoterWalletByProfileId(profileId);
  const contract = getContract(loadContractAddress()).connect(voterWallet);
  let commitHash = commitment;
  if (!commitHash) {
    const packed = ethers.solidityPacked(['string', 'string'], [candidateId, secret]);
    commitHash = ethers.keccak256(packed);
  }
  const tx = await contract.commitVote(electionId, commitHash);
  const receipt = await tx.wait();
  return { ok: true, txHash: receipt.hash };
});

app.post('/vote/reveal', async (req) => {
  const schema = z.object({
    electionId: z.string().min(1),
    profileId: z.string().min(1),
    candidateId: z.string().min(1),
    secret: z.string().min(1)
  });
  const { electionId, profileId, candidateId, secret } = schema.parse(req.body);
  const voterWallet = await getVoterWalletByProfileId(profileId);
  const contract = getContract(loadContractAddress()).connect(voterWallet);
  const tx = await contract.revealVote(electionId, candidateId, secret);
  const receipt = await tx.wait();
  return { ok: true, txHash: receipt.hash };
});

app.listen({ port: PORT, host: '0.0.0.0' })
  .then(() => {
    app.log.info(`relay listening on :${PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
