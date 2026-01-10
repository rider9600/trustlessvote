#!/usr/bin/env node

/**
 * View all profile-wallet mappings and wallet pool status
 */

import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function main() {
  console.log('═'.repeat(80));
  console.log('TRUSTLESSVOTE - WALLET ASSIGNMENTS');
  console.log('═'.repeat(80));
  console.log('');

  try {
    // Get all profiles with their wallet addresses
    const { rows: profiles } = await pool.query(`
      SELECT 
        p.id,
        p.full_name,
        p.email,
        p.role,
        p.wallet_address,
        p.created_at,
        w.private_key,
        w.is_assigned,
        w.assigned_at
      FROM public.profiles p
      LEFT JOIN public.hardhat_wallet_pool w 
        ON p.wallet_address = w.wallet_address
      ORDER BY p.created_at ASC
    `);

    console.log(`📋 Total Profiles: ${profiles.length}`);
    console.log('');

    if (profiles.length > 0) {
      console.log('👥 PROFILE → WALLET MAPPINGS:');
      console.log('─'.repeat(80));
      
      profiles.forEach((p, index) => {
        console.log(`\n[${index + 1}] ${p.full_name} (${p.role.toUpperCase()})`);
        console.log(`    Email:   ${p.email}`);
        console.log(`    Wallet:  ${p.wallet_address || 'NOT ASSIGNED'}`);
        if (p.private_key) {
          console.log(`    Key:     ${p.private_key}`);
        }
        console.log(`    Created: ${new Date(p.created_at).toLocaleString()}`);
      });
      
      console.log('\n');
    }

    // Get wallet pool stats
    const { rows: stats } = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_assigned = true THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN is_assigned = false THEN 1 ELSE 0 END) as available
      FROM public.hardhat_wallet_pool
    `);

    console.log('═'.repeat(80));
    console.log('💰 WALLET POOL STATUS:');
    console.log('─'.repeat(80));
    console.log(`Total Wallets:     ${stats[0].total} / 20`);
    console.log(`Assigned:          ${stats[0].assigned}`);
    console.log(`Available:         ${stats[0].available}`);
    console.log('═'.repeat(80));

    // Show available wallets
    if (parseInt(stats[0].available) > 0) {
      const { rows: available } = await pool.query(`
        SELECT wallet_address 
        FROM public.hardhat_wallet_pool 
        WHERE is_assigned = false 
        ORDER BY id ASC
      `);
      
      console.log('');
      console.log('✨ AVAILABLE WALLETS:');
      console.log('─'.repeat(80));
      available.forEach((w, idx) => {
        console.log(`  ${idx + 1}. ${w.wallet_address}`);
      });
      console.log('');
    }

    // Get contract address from .env.local
    console.log('═'.repeat(80));
    console.log('📜 DEPLOYED CONTRACT:');
    console.log('─'.repeat(80));
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const envPath = path.join(__dirname, '..', '.env.local');
      
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/VITE_CONTRACT_ADDRESS=(.+)/);
        if (match) {
          console.log(`Contract Address:  ${match[1]}`);
          console.log(`Network:           Hardhat Local (localhost:8545)`);
          console.log(`Chain ID:          31337`);
        } else {
          console.log('⚠️  No contract address found in .env.local');
        }
      } else {
        console.log('⚠️  .env.local file not found');
      }
    } catch (error) {
      console.log('⚠️  Could not read .env.local');
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
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Failed:', error);
    process.exit(1);
  });
