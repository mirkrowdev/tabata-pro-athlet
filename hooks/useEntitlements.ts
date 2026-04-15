import { useState, useEffect } from 'react';

interface EntitlementsResult {
  isPro: boolean;
}

/**
 * Hook for managing user entitlements and subscription status.
 * Currently returns isPro: true for all users.
 *
 * In Phase 2, this will be replaced with RevenueCat integration to check
 * actual subscription status. This is the only file that needs to change
 * to enable freemium functionality.
 */
export default function useEntitlements(): EntitlementsResult {
  // TODO: Replace with RevenueCat integration in Phase 2
  // const [isPro, setIsPro] = useState(false);
  //
  // useEffect(() => {
  //   // Initialize RevenueCat and check subscription status
  //   // setIsPro(...) based on active entitlements
  // }, []);

  return { isPro: true };
}