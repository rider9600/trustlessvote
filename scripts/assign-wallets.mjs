#!/usr/bin/env node

/**
 * Auto-assign Hardhat wallets to profiles in database
 * Maps each profile to one of the 20 pre-funded Hardhat accounts
 */

import pg from 'pg';

const { Pool } = pg;

// Database connection (local Docker Postgres)
const pool = new Pool({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function main() {
  console.log('🔗 Connecting to database...');
  
  try {
    // Get profiles without wallet addresses
    const { rows: unassignedProfiles } = await pool.query(`
      SELECT id, full_name, email, role 
      FROM public.profiles 
      WHERE wallet_address IS NULL 
      ORDER BY created_at ASC
    `);

    if (unassignedProfiles.length === 0) {
      console.log('✅ All profiles already have wallet addresses assigned!');
      return;
    }

    console.log(`📋 Found ${unassignedProfiles.length} profiles without wallet addresses`);
    console.log('');

    // Get available wallets from pool
    const { rows: availableWallets } = await pool.query(`
      SELECT wallet_address, private_key 
      FROM public.hardhat_wallet_pool 
      WHERE is_assigned = false 
      ORDER BY id ASC
    `);

    if (availableWallets.length === 0) {
      console.log('⚠️  No available wallets in pool! All 20 Hardhat accounts are already assigned.');
      console.log(`   Cannot assign wallets to ${unassignedProfiles.length} profiles.`);
      return;
    }

    console.log(`💰 Found ${availableWallets.length} available wallets in pool`);
    console.log('');

    // Assign wallets to profiles
    let assignedCount = 0;
    const maxAssignments = Math.min(unassignedProfiles.length, availableWallets.length);

    console.log(`🔄 Assigning wallets to profiles...`);
    console.log('');

    for (let i = 0; i < maxAssignments; i++) {
      const profile = unassignedProfiles[i];
      const wallet = availableWallets[i];

      // Update profile with wallet address
      await pool.query(`
        UPDATE public.profiles 
        SET wallet_address = $1 
        WHERE id = $2
      `, [wallet.wallet_address, profile.id]);

      // Mark wallet as assigned in pool
      await pool.query(`
        UPDATE public.hardhat_wallet_pool 
        SET is_assigned = true, 
            assigned_to_profile_id = $1, 
            assigned_at = NOW() 
        WHERE wallet_address = $2
      `, [profile.id, wallet.wallet_address]);

      assignedCount++;
      
      console.log(`✓ Profile: ${profile.full_name} (${profile.email})`);
      console.log(`  Wallet:  ${wallet.wallet_address}`);
      console.log(`  Role:    ${profile.role}`);
      console.log('');
    }

    console.log('═'.repeat(80));
    console.log(`✅ Successfully assigned ${assignedCount} wallet(s)`);
    
    if (unassignedProfiles.length > availableWallets.length) {
      const remaining = unassignedProfiles.length - availableWallets.length;
      console.log(`⚠️  ${remaining} profile(s) still without wallets (pool exhausted)`);
    }
    
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
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
