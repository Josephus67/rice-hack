/**
 * useNetwork Hook
 * Monitors network connectivity status using expo-network
 */

import { useState, useEffect, useCallback } from 'react';
import * as Network from 'expo-network';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: Network.NetworkStateType;
  isWifi: boolean;
  isCellular: boolean;
}

interface UseNetworkResult {
  isOnline: boolean;
  isOffline: boolean;
  networkStatus: NetworkStatus;
  checkConnection: () => Promise<boolean>;
}

export function useNetwork(): UseNetworkResult {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: Network.NetworkStateType.UNKNOWN,
    isWifi: false,
    isCellular: false,
  });

  const fetchNetworkState = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type ?? Network.NetworkStateType.UNKNOWN,
        isWifi: state.type === Network.NetworkStateType.WIFI,
        isCellular: state.type === Network.NetworkStateType.CELLULAR,
      });
    } catch (error) {
      console.error('Error fetching network state:', error);
    }
  }, []);

  useEffect(() => {
    // Get initial state
    fetchNetworkState();

    // Poll for network changes every 5 seconds
    // (expo-network doesn't have subscription API like NetInfo)
    const interval = setInterval(fetchNetworkState, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchNetworkState]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected ?? false;
  }, []);

  const isOnline = networkStatus.isConnected && networkStatus.isInternetReachable;

  return {
    isOnline,
    isOffline: !isOnline,
    networkStatus,
    checkConnection,
  };
}
