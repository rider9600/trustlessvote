import express from 'express';
import { query } from './db.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { assignWalletToProfile } from './wallets.ts';

const router = express.Router();

const JWT_SECRET = process.env.API_JWT_SECRET || 'dev-api-jwt-secret-change-me';

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body as {
      email: string; password: string; full_name: string; role: 'admin'|'voter'
    };

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await query('select id, email from public.profiles where email=$1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);

    await query(
      'insert into public.profiles (id, full_name, email, role) values ($1, $2, $3, $4)',
      [id, full_name, email, role]
    );

    await query(
      'insert into public.users (user_id, email, password_hash, role) values ($1, $2, $3, $4)',
      [id, email, hash, role]
    );

    // Auto-assign next available wallet
    const walletAddress = await assignWalletToProfile(id);
    console.log(`[signup] User ${email} assigned wallet: ${walletAddress || 'none (pool exhausted)'}`);

    const token = jwt.sign({ sub: id, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, email, role, wallet_address: walletAddress } });
  } catch (err) {
    console.error('[signup] error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const userRes = await query('select user_id, password_hash, role from public.users where email=$1', [email]);
    if (userRes.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const { user_id, password_hash, role } = userRes.rows[0];
    const ok = await bcrypt.compare(password, password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user_id, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user_id, email, role } });
  } catch (err) {
    console.error('[login] error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
