import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Returns true when the device has a usable internet connection.
 * Treats null `isInternetReachable` as online (NetInfo can't tell yet) so we
 * never block a request that might work.
 */
function isReachable(state: NetInfoState): boolean {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

/** Subscribe to connectivity changes (for components that need live updates). */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(isReachable(state));
    });
    return unsubscribe;
  }, []);

  return isOnline;
}

/** One-shot connectivity check (for imperative code paths). */
export async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return isReachable(state);
  } catch {
    return true;
  }
}
