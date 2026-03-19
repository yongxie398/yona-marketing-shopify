import { SWRConfiguration } from 'swr';

// Global fetcher for SWR
export const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object
    (error as any).info = await response.json();
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

// SWR configuration options
export const swrConfig: SWRConfiguration = {
  // Don't revalidate on mount (use cached data if available)
  revalidateOnMount: true,
  // Revalidate when window regains focus
  revalidateOnFocus: false, // Disabled - user will refresh manually
  // Revalidate when network reconnects
  revalidateOnReconnect: true,
  // Retry on error
  shouldRetryOnError: true,
  // Error retry count
  errorRetryCount: 3,
  // Error retry interval (exponential backoff)
  errorRetryInterval: 5000,
  // Deduping interval - requests within this time frame will be deduped
  dedupingInterval: 60000, // 1 minute
  // Keep previous data while fetching new data
  keepPreviousData: true,
  // Loading timeout
  loadingTimeout: 10000,
};

// Specific configurations for different data types
export const swrConfigs = {
  // Revenue analytics - rarely changes, cache for 5 minutes
  revenue: {
    ...swrConfig,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 0, // No auto-refresh
  },
  
  // Campaign performance - cache for 5 minutes
  campaigns: {
    ...swrConfig,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 0, // No auto-refresh
  },
  
  // Activity feed - more frequent updates, but still manual refresh
  activity: {
    ...swrConfig,
    dedupingInterval: 60000, // 1 minute
    refreshInterval: 0, // No auto-refresh
  },
  
  // First sale - check once, rarely changes
  firstSale: {
    ...swrConfig,
    dedupingInterval: 600000, // 10 minutes
    refreshInterval: 0, // No auto-refresh
  },
  
  // Scheduler status - occasional check
  scheduler: {
    ...swrConfig,
    dedupingInterval: 30000, // 30 seconds
    refreshInterval: 0, // No auto-refresh
  },
};
