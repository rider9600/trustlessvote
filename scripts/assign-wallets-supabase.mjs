#!/usr/bin/env node

/**
 * Randomly assign Hardhat wallets to Supabase profiles
 * This connects to your hosted Supabase instance
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔗 Connecting to Supabase...');
  console.log('📡 URL:', supabaseUrl);
  console.log('');

  try {
    // Get profiles without wallet addresses
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .is('wallet_address', null)
      .order('created_at', { ascending: true });

    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) {
      console.log('✅ All profiles already have wallet addresses!');
      return;
    }

    console.log(`📋 Found ${profiles.length} profile(s) without wallet addresses`);
    console.log('');

    // Get available wallets from pool
    const { data: availableWallets, error: walletError } = await supabase
      .from('hardhat_wallet_pool')
      .select('wallet_address, private_key')
      .eq('is_assigned', false)
      .order('id', { ascending: true });

    if (walletError) throw walletError;

    if (!availableWallets || availableWallets.length === 0) {
      console.log('⚠️  No available wallets! All 20 accounts are assigned.');
      return;
    }

    console.log(`💰 Found ${availableWallets.length} available wallet(s)`);
    console.log('');

    // Assign wallets sequentially (address0, address1, address2...)
    const assignments = Math.min(profiles.length, availableWallets.length);
    console.log(`📍 Sequentially assigning ${assignments} wallet(s) (address0, address1, ...)...`);
    console.log('');

    for (let i = 0; i < assignments; i++) {
      const profile = profiles[i];
      const wallet = availableWallets[i]; // Sequential, not random

      // Update profile with wallet address
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ wallet_address: wallet.wallet_address })
        .eq('id', profile.id);

      if (updateProfileError) {
        console.error(`❌ Failed to update profile ${profile.email}:`, updateProfileError.message);
        continue;
      }

      // Mark wallet as assigned
      const { error: updateWalletError } = await supabase
        .from('hardhat_wallet_pool')
        .update({
          is_assigned: true,
          assigned_to_profile_id: profile.id,
          assigned_at: new Date().toISOString()
        })
        .eq('wallet_address', wallet.wallet_address);

      if (updateWalletError) {
        console.error(`❌ Failed to mark wallet as assigned:`, updateWalletError.message);
        continue;
      }

      console.log(`✓ ${profile.full_name} (${profile.role})`);
      console.log(`  Email:  ${profile.email}`);
      console.log(`  Wallet: ${wallet.wallet_address}`);
      console.log('');
    }

    console.log('═'.repeat(80));
    console.log(`✅ Successfully assigned ${assignments} wallet(s)!`);
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main()
  .then(() => {
    console.log('');
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Failed:', error);
    process.exit(1);
  });
