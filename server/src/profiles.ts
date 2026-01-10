import express from 'express';
import { query } from './db.ts';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.API_JWT_SECRET || 'dev-api-jwt-secret-change-me';

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /profiles/me
router.get('/me', requireAuth, async (req, res) => {
  const user = (req as any).user as { sub: string };
  try {
    const r = await query('select * from public.profiles where id=$1', [user.sub]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('[profiles/me] error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

// Additional endpoints to support search/update/get by id used by frontend
router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const role = req.query.role ? String(req.query.role) : undefined;
  if (!q) return res.json([]);
  try {
    let sql = 'select * from public.profiles where full_name ilike $1';
    const params: any[] = [`%${q}%`];
    if (role) {
      sql += ' and role = $2';
      params.push(role);
    }
    sql += ' order by created_at desc limit 5';
    const r = await query(sql, params);
    res.json(r.rows);
  } catch (err) {
    console.error('[profiles/search] error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await query('select * from public.profiles where id=$1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('[profiles/:id] error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  const fields = ['full_name', 'role', 'wallet_address'];
  const updates: Record<string, any> = {};
  for (const f of fields) {
    if (f in req.body) updates[f] = req.body[f];
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' });
  const sets = Object.keys(updates).map((k, i) => `${k}=$${i + 1}`).join(', ');
  const params = [...Object.values(updates), req.params.id];
  try {
    const r = await query(`update public.profiles set ${sets} where id=$${params.length} returning *`, params);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('[profiles PATCH] error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
