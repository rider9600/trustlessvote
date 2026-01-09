import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.docker" });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "http://localhost:8000";
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!anonKey) {
  console.error("[test] Missing VITE_SUPABASE_ANON_KEY; set it in .env.docker");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function testLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`[test] Login failed for ${email}:`, error.message);
    return false;
  }
  console.log(`[test] Login OK for ${email}:`, data.user?.id);

  // verify profile exists
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, role, wallet_address")
    .eq("email", email)
    .limit(1);
  if (pErr) {
    console.error(`[test] Read profile failed for ${email}:`, pErr.message);
    return false;
  }
  if (!profiles || profiles.length === 0) {
    console.error(`[test] No profile row for ${email}`);
    return false;
  }
  console.log(`[test] Profile OK for ${email}:`, profiles[0]);
  return true;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@trustlessvote.local";
  const adminPass = process.env.ADMIN_PASSWORD || "admin123456";
  const voterEmail = "voter01@trustlessvote.local";
  const voterPass = process.env.VOTER_PASSWORD || "voter123456";

  console.log(`[test] Using Supabase: ${url}`);

  const adminOk = await testLogin(adminEmail, adminPass);
  const voterOk = await testLogin(voterEmail, voterPass);

  if (!adminOk || !voterOk) {
    console.error("[test] One or more login checks failed.");
    process.exit(1);
  }

  console.log("[test] All login checks passed.");
}

main().catch((e) => {
  console.error("[test] Unexpected error:", e?.message || e);
  process.exit(1);
});
