import useSWR from 'swr';
import { fetcher, swrConfigs } from '@/lib/swr-config';

// Hook for revenue analytics
export function useRevenueAnalytics(storeId: string | undefined, timeRange: string) {
  const { data, error, isLoading, mutate } = useSWR(
    storeId ? `/api/analytics/revenue/${storeId}?timeRange=${timeRange}` : null,
    fetcher,
    swrConfigs.revenue
  );

  return {
    revenue: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Hook for campaign performance
export function useCampaignPerformance(storeId: string | undefined, timeRange: string) {
  const { data, error, isLoading, mutate } = useSWR(
    storeId ? `/api/analytics/campaign-performance/${storeId}?timeRange=${timeRange}` : null,
    fetcher,
    swrConfigs.campaigns
  );

  return {
    campaigns: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Hook for activity feed
export function useActivityFeed(storeId: string | undefined, limit: number = 50) {
  const { data, error, isLoading, mutate } = useSWR(
    storeId ? `/api/activity?storeId=${storeId}&limit=${limit}&days=7` : null,
    fetcher,
    swrConfigs.activity
  );

  return {
    activities: data?.activities || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Hook for first sale status
export function useFirstSaleStatus(shopDomain: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    shopDomain ? `/api/first-sale?shop=${encodeURIComponent(shopDomain)}` : null,
    fetcher,
    swrConfigs.firstSale
  );

  return {
    firstSaleData: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Hook for scheduler status
export function useSchedulerStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/scheduler/status',
    fetcher,
    swrConfigs.scheduler
  );

  return {
    status: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Combined hook for all dashboard data
export function useDashboardData(storeId: string | undefined, timeRange: string) {
  const revenue = useRevenueAnalytics(storeId, timeRange);
  const campaigns = useCampaignPerformance(storeId, timeRange);
  const activity = useActivityFeed(storeId);

  const refreshAll = () => {
    revenue.refresh();
    campaigns.refresh();
    activity.refresh();
  };

  return {
    revenue,
    campaigns,
    activity,
    refreshAll,
    isLoading: revenue.isLoading || campaigns.isLoading || activity.isLoading,
    isError: revenue.isError || campaigns.isError || activity.isError,
  };
}
