import 'dotenv/config';
import { query } from './db.ts';
import bcrypt from 'bcryptjs';

async function run() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@trustlessvote.local';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123456';
  const voterPass = process.env.VOTER_PASSWORD || 'voter123456';

  const profilesRes = await query(
    "select id, email, role from public.profiles where email=$1 or email like 'voter%'",
    [adminEmail]
  );

  for (const row of profilesRes.rows) {
    const exists = await query('select 1 from public.users where email=$1', [row.email]);
    if (exists.rowCount > 0) continue;
    const pw = row.role === 'admin' ? adminPass : voterPass;
    const hash = await bcrypt.hash(pw, 10);
    await query(
      'insert into public.users (user_id, email, password_hash, role) values ($1, $2, $3, $4)',
      [row.id, row.email, hash, row.role]
    );
    console.log(`[seed-users] created user for ${row.email}`);
  }
  console.log('[seed-users] done');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
