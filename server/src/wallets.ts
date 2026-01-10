import { query } from './db.ts';

/**
 * Auto-assign next available Hardhat wallet to a new profile
 */
export async function assignWalletToProfile(profileId: string): Promise<string | null> {
  try {
    // Get next available wallet (sequential order)
    const walletResult = await query(
      `SELECT wallet_address, private_key 
       FROM public.hardhat_wallet_pool 
       WHERE is_assigned = FALSE 
       ORDER BY id ASC 
       LIMIT 1`,
      []
    );

    if (walletResult.rowCount === 0) {
      console.warn('[wallets] No available wallets in pool');
      return null;
    }

    const { wallet_address, private_key } = walletResult.rows[0];

    // Update profile with wallet address
    await query(
      'UPDATE public.profiles SET wallet_address = $1 WHERE id = $2',
      [wallet_address, profileId]
    );

    // Mark wallet as assigned
    await query(
      `UPDATE public.hardhat_wallet_pool 
       SET is_assigned = TRUE, 
           assigned_to_profile_id = $1, 
           assigned_at = NOW() 
       WHERE wallet_address = $2`,
      [profileId, wallet_address]
    );

    console.log(`[wallets] Assigned ${wallet_address} to profile ${profileId}`);
    return wallet_address;
  } catch (error) {
    console.error('[wallets] Error assigning wallet:', error);
    throw error;
  }
}

/**
 * Get wallet details for a profile (including private key for backend signing)
 */
export async function getWalletForProfile(profileId: string): Promise<{ address: string; privateKey: string } | null> {
  try {
    const result = await query(
      `SELECT p.wallet_address, w.private_key
       FROM public.profiles p
       LEFT JOIN public.hardhat_wallet_pool w ON p.wallet_address = w.wallet_address
       WHERE p.id = $1`,
      [profileId]
    );

    if (result.rowCount === 0 || !result.rows[0].wallet_address) {
      return null;
    }

    return {
      address: result.rows[0].wallet_address,
      privateKey: result.rows[0].private_key
    };
  } catch (error) {
    console.error('[wallets] Error getting wallet:', error);
    throw error;
  }
}

/**
 * Get pool statistics
 */
export async function getWalletPoolStats() {
  const result = await query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_assigned = TRUE THEN 1 ELSE 0 END) as assigned,
      SUM(CASE WHEN is_assigned = FALSE THEN 1 ELSE 0 END) as available
     FROM public.hardhat_wallet_pool`,
    []
  );

  return result.rows[0];
}
