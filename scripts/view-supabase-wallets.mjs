#!/usr/bin/env node

/**
 * View profile-wallet mappings in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('═'.repeat(80));
  console.log('SUPABASE - WALLET ASSIGNMENTS');
  console.log('═'.repeat(80));
  console.log('');

  try {
    // Get all profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, wallet_address, created_at')
      .order('created_at', { ascending: true });

    if (profileError) throw profileError;

    console.log(`📋 Total Profiles: ${profiles?.length || 0}`);
    console.log('');

    if (profiles && profiles.length > 0) {
      console.log('👥 PROFILE → WALLET MAPPINGS:');
      console.log('─'.repeat(80));
      
      for (let i = 0; i < profiles.length; i++) {
        const p = profiles[i];
        console.log(`\n[${i + 1}] ${p.full_name} (${p.role.toUpperCase()})`);
        console.log(`    Email:   ${p.email}`);
        console.log(`    Wallet:  ${p.wallet_address || 'NOT ASSIGNED'}`);
        
        // Get private key if assigned
        if (p.wallet_address) {
          const { data: wallet } = await supabase
            .from('hardhat_wallet_pool')
            .select('private_key')
            .eq('wallet_address', p.wallet_address)
            .single();
          
          if (wallet) {
            console.log(`    Key:     ${wallet.private_key}`);
          }
        }
      }
      console.log('\n');
    }

    // Get wallet pool stats
    const { data: poolStats, error: statsError } = await supabase
      .from('hardhat_wallet_pool')
      .select('is_assigned');

    if (statsError) throw statsError;

    const total = poolStats?.length || 0;
    const assigned = poolStats?.filter(w => w.is_assigned).length || 0;
    const available = total - assigned;

    console.log('═'.repeat(80));
    console.log('💰 WALLET POOL STATUS:');
    console.log('─'.repeat(80));
    console.log(`Total Wallets:     ${total} / 20`);
    console.log(`Assigned:          ${assigned}`);
    console.log(`Available:         ${available}`);
    console.log('═'.repeat(80));

    // Show contract address
    console.log('');
    console.log('═'.repeat(80));
    console.log('📜 DEPLOYED CONTRACT:');
    console.log('─'.repeat(80));
    
    const fs = await import('fs');
    const envPath = path.join(__dirname, '..', '.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const addressMatch = envContent.match(/VITE_CONTRACT_ADDRESS=(.+)/);
      const rpcMatch = envContent.match(/VITE_RPC_URL=(.+)/);
      
      if (addressMatch) {
        console.log(`Contract Address:  ${addressMatch[1]}`);
      }
      if (rpcMatch) {
        console.log(`RPC URL:           ${rpcMatch[1]}`);
      }
      console.log(`Chain ID:          31337`);
    }
    
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main()
  .then(() => {
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Failed:', error);
    process.exit(1);
  });
