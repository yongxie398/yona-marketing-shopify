'use client';

import { useState, useEffect } from 'react';
import { Card, Text, Badge, Spinner, Button, Banner } from '@shopify/polaris';

interface Activity {
  id: string;
  timestamp: string;
  type: 'send' | 'skip' | 'skip_control_group' | 'decision';
  campaign_type: string;
  description: string;
  customer: {
    email: string;
    first_name: string;
  };
  message_id?: string;
  message_status?: string;
  attributed_revenue?: number;
  icon: string;
  color: string;
}

interface ActivityFeedProps {
  storeId: string;
  limit?: number;
  showTitle?: boolean;
}

export default function ActivityFeed({ storeId, limit = 10, showTitle = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchActivities = async (isPolling = false) => {
    if (!storeId) return;

    try {
      if (!isPolling) {
        setLoading(true);
      }

      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/billing/stores/${storeId}/activity-feed`);
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('days', '7');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Failed to fetch activity feed: ${response.status}`);
      }

      const data = await response.json();
      setActivities(data.activities || []);
      setHasMore(data.activities?.length === limit);
      
      if (data.activities?.length > 0) {
        setLastId(data.activities[0].id);
      }
    } catch (err) {
      console.error('Error fetching activity feed:', err);
      if (!isPolling) {
        setError('Failed to load activity feed');
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchActivities();
  }, [storeId, limit]);

  // Polling for real-time updates
  useEffect(() => {
    if (!storeId) return;

    const pollInterval = setInterval(async () => {
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/billing/stores/${storeId}/activity-stream`);
        if (lastId) {
          url.searchParams.append('last_id', lastId);
        }

        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          if (data.new_activities?.length > 0) {
            setActivities(prev => [...data.new_activities, ...prev].slice(0, limit));
            setLastId(data.new_activities[0].id);
          }
        }
      } catch (err) {
        // Silent fail on polling
        console.debug('Polling error:', err);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [storeId, lastId, limit]);

  const getBadgeStatus = (type: string) => {
    switch (type) {
      case 'send':
        return 'success';
      case 'skip':
        return 'warning';
      case 'skip_control_group':
        return 'info';
      default:
        return 'default';
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'send':
        return 'Sent';
      case 'skip':
        return 'Skipped';
      case 'skip_control_group':
        return 'Control Group';
      default:
        return type;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spinner size="small" />
          <Text as="p" variant="bodySm" tone="subdued">
            Loading AI activity...
          </Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Banner tone="critical">
          <p>{error}</p>
          <Button onClick={() => fetchActivities()} size="slim">
            Retry
          </Button>
        </Banner>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        {showTitle && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e1e3e5' }}>
            <Text variant="headingMd" as="h2">
              🤖 AI Activity Feed
            </Text>
          </div>
        )}
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Text as="p" variant="bodyMd" tone="subdued">
            No AI activity yet. The AI will start monitoring your store soon.
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e1e3e5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="headingMd" as="h2">
              🤖 AI Activity Feed
            </Text>
            <Badge tone="success">Live</Badge>
          </div>
          <Text as="p" variant="bodySm" tone="subdued">
            Real-time view of AI decisions
          </Text>
        </div>
      )}
      
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            style={{
              padding: '16px 20px',
              borderBottom: index < activities.length - 1 ? '1px solid #e1e3e5' : 'none',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}
          >
            <div style={{ fontSize: '20px', flexShrink: 0 }}>
              {activity.icon}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge tone={getBadgeStatus(activity.type)}>
                    {getBadgeLabel(activity.type)}
                  </Badge>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {activity.campaign_type?.replace('_', ' ')}
                  </Text>
                </div>
                <Text as="span" variant="bodySm" tone="subdued">
                  {formatTime(activity.timestamp)}
                </Text>
              </div>
              
              <Text as="p" variant="bodyMd">
                {activity.description}
              </Text>
              
              {activity.attributed_revenue && activity.attributed_revenue > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <Badge tone="success">
                    💰 ${activity.attributed_revenue.toFixed(2)} recovered
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e1e3e5', textAlign: 'center' }}>
          <Button variant="plain" onClick={() => fetchActivities()}>
            Load more
          </Button>
        </div>
      )}
    </Card>
  );
}
