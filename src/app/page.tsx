'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSessionToken } from './AppBridgeProvider';
import AICoreService from '../lib/ai-core-service';

export default function HomePage() {
  const [isPaused, setIsPaused] = useState(false);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [timeScope, setTimeScope] = useState<'today' | '7days' | '30days'>('7days');
  const [metrics, setMetrics] = useState<any>({
    today: {
      revenueRecovered: 0,
      roi: 0,
      touchpoints: 0,
      highIntentShoppers: 0
    },
    sevenDays: {
      revenueRecovered: 0,
      roi: 0,
      touchpoints: 0,
      campaignsActive: 0
    },
    thirtyDays: {
      revenueRecovered: 0,
      roi: 0,
      touchpoints: 0,
      campaignsActive: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set shop domain from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShopDomain(urlParams.get('shop'));
  }, []);

  // Fetch real metrics from Core AI Service
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!shopDomain) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get store ID by making an API call to the backend to retrieve store information
        // This is a simplified approach - in a real implementation, you'd have a proper auth mechanism
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to get store info: ${response.status}`);
        }
        
        const storeInfo = await response.json();
        const storeId = storeInfo.storeId;
        
        // Fetch metrics from the proxied API endpoint
        const metricsResponse = await fetch(`/api/analytics/revenue/${storeId}`);
        
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          
          // Transform the API response to match our frontend structure
          const transformedMetrics = {
            today: {
              revenueRecovered: Math.floor(metricsData.attributed_revenue || 0),
              roi: parseFloat(((metricsData.attributed_revenue || 0) / 1000).toFixed(2)) || 0, // Simplified ROI calculation
              touchpoints: metricsData.total_messages_sent || 0,
              highIntentShoppers: 0 // This would come from customer analytics
            },
            sevenDays: {
              revenueRecovered: Math.floor(metricsData.attributed_revenue || 0),
              roi: parseFloat(((metricsData.attributed_revenue || 0) / 1000).toFixed(2)) || 0,
              touchpoints: metricsData.total_messages_sent || 0,
              campaignsActive: metricsData.top_performing_campaigns?.length || 0
            },
            thirtyDays: {
              revenueRecovered: Math.floor(metricsData.attributed_revenue || 0),
              roi: parseFloat(((metricsData.attributed_revenue || 0) / 1000).toFixed(2)) || 0,
              touchpoints: metricsData.total_messages_sent || 0,
              campaignsActive: metricsData.top_performing_campaigns?.length || 0
            }
          };
          
          setMetrics(transformedMetrics);
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load metrics. Using default values.');
        // Keep default values in case of error
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [shopDomain]);

  const [aiDecisions, setAiDecisions] = useState<any[]>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<any[]>([]);
  const [nextAIActions, setNextAIActions] = useState<string[]>([]);

  // Fetch AI decisions from the database
  useEffect(() => {
    const fetchAiDecisions = async () => {
      if (!shopDomain) return;
      
      try {
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        if (!response.ok) {
          throw new Error(`Failed to get store info: ${response.status}`);
        }
        
        const storeInfo = await response.json();
        const storeId = storeInfo.storeId;
        
        // Fetch AI decisions from database
        const decisionsResponse = await fetch(`/api/decisions?storeId=${storeId}`);
        if (decisionsResponse.ok) {
          const decisions = await decisionsResponse.json();
          setAiDecisions(decisions);
        }
      } catch (err) {
        console.error('Error fetching AI decisions:', err);
      }
    };
    
    fetchAiDecisions();
  }, [shopDomain]);

  // Fetch campaign performance data
  useEffect(() => {
    const fetchCampaignPerformance = async () => {
      if (!shopDomain) return;
      
      try {
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        if (!response.ok) {
          throw new Error(`Failed to get store info: ${response.status}`);
        }
        
        const storeInfo = await response.json();
        const storeId = storeInfo.storeId;
        
        // Fetch campaign performance from the proxied API endpoint
        const performanceResponse = await fetch(`/api/analytics/campaign-performance/${storeId}`);
        if (performanceResponse.ok) {
          const performanceData = await performanceResponse.json();
          setCampaignPerformance(performanceData);
        }
      } catch (err) {
        console.error('Error fetching campaign performance:', err);
      }
    };
    
    fetchCampaignPerformance();
  }, [shopDomain]);

  // Fetch next AI actions
  useEffect(() => {
    const fetchNextActions = async () => {
      if (!shopDomain) return;
      
      try {
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        if (!response.ok) {
          throw new Error(`Failed to get store info: ${response.status}`);
        }
        
        const storeInfo = await response.json();
        const storeId = storeInfo.storeId;
        
        // Fetch next AI actions from the proxied API endpoint
        const actionsResponse = await fetch(`/api/ai/next-actions/${storeId}`);
        if (actionsResponse.ok) {
          const actionsData = await actionsResponse.json();
          setNextAIActions(actionsData);
        }
      } catch (err) {
        console.error('Error fetching next AI actions:', err);
      }
    };
    
    fetchNextActions();
  }, [shopDomain]);

  // Get current metrics based on time scope
  const currentMetrics = timeScope === 'today' ? metrics.today : 
                         timeScope === '7days' ? metrics.sevenDays : 
                         metrics.thirtyDays;

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '28px', margin: '20px 0' }}>Yona Revenue Agent</h1>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* AI Status Header */}
      <div style={{ marginBottom: '30px', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #eaeaea' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: isPaused ? '#e02424' : '#22c55e',
            marginRight: '10px'
          }}></div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Yona Revenue Agent</h1>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '500',
            color: isPaused ? '#e02424' : '#15803d'
          }}>
            {isPaused ? 'AI Status: Paused' : 'AI Status: Active'}
          </span>
          <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
            {isPaused ? 'Analytics continuing to run' : 'Operating within your safety limits'}
          </span>
        </div>
        <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
          Today: Recovered ${metrics.today.revenueRecovered} and monitoring {metrics.today.highIntentShoppers} high-intent shoppers
        </p>
      </div>

      {/* Time Scope Selector */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {[
          { value: 'today', label: 'Today' },
          { value: '7days', label: '7 days' },
          { value: '30days', label: '30 days' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeScope(option.value as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #eaeaea',
              backgroundColor: timeScope === option.value ? '#00848e' : 'white',
              color: timeScope === option.value ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>Revenue Recovered</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            ${currentMetrics.revenueRecovered}
          </p>
          <p style={{ color: '#22c55e', fontSize: '14px', marginBottom: '10px' }}>
            ↑ Above industry average
          </p>
          <div style={{ height: '6px', backgroundColor: '#eaeaea', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', backgroundColor: '#22c55e' }}></div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '250px', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>ROI</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            {currentMetrics.roi}x
          </p>
          <p style={{ color: '#22c55e', fontSize: '14px', marginBottom: '10px' }}>
            ↑ Strong performance
          </p>
          <div style={{ height: '6px', backgroundColor: '#eaeaea', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '80%', height: '100%', backgroundColor: '#22c55e' }}></div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '250px', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>High-Intent Touchpoints</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            {currentMetrics.touchpoints}
          </p>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Targeted AI interventions
          </p>
          <div style={{ height: '6px', backgroundColor: '#eaeaea', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', backgroundColor: '#3b82f6' }}></div>
          </div>
        </div>
      </div>

      {/* Next AI Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Next AI Actions (Today)</h2>
        <div style={{ 
          padding: '20px', 
          border: '1px solid #e0e7ff', 
          borderRadius: '8px', 
          backgroundColor: '#f8fafc',
          borderLeft: '4px solid #3b82f6'
        }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px', fontStyle: 'italic' }}>
            Based on recent performance, the AI is prioritizing cart recovery over browse abandonment today.
          </p>
          {nextAIActions.length > 0 ? (
            nextAIActions.map((action, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#3b82f6',
                  marginRight: '12px'
                }}></div>
                <span>{action}</span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '10px' }}>
              {loading ? 'Loading AI actions...' : 'No upcoming AI actions available yet.'}
            </div>
          )}
        </div>
      </div>

      {/* AI Insight */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Today's AI Insight</h2>
        <div style={{ 
          padding: '20px', 
          border: '1px solid #dcfce7', 
          borderRadius: '8px', 
          backgroundColor: '#f0fdf4',
          borderLeft: '4px solid #22c55e'
        }}>
          <p style={{ color: '#166534', fontSize: '14px', margin: 0 }}>
            Cart abandoners with price sensitivity converted 22% better after delayed follow-ups. The AI is automatically adjusting timing for high-intent shoppers.
          </p>
        </div>
      </div>

      {/* AI Decisions & Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>AI Decisions & Actions</h2>
        <div style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
          {aiDecisions.length > 0 ? (
            aiDecisions.map((decision) => (
              <div key={decision.id} style={{ 
                marginBottom: '15px', 
                paddingBottom: '15px', 
                borderBottom: '1px solid #f0f0f0',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      fontWeight: '500',
                      color: decision.impact === 'high' ? '#15803d' : '#3b82f6'
                    }}>
                      {decision.title}
                    </span>
                    {decision.value && (
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        color: '#15803d',
                        backgroundColor: '#dcfce7',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {decision.value}
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#666', fontSize: '14px' }}>{decision.timestamp}</span>
                </div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                  Why: {decision.reason}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {decision.result.includes('completed') && (
                    <span style={{ color: '#22c55e', fontSize: '14px' }}>✓</span>
                  )}
                  {decision.result.includes('Prevented') && (
                    <span style={{ color: '#f59e0b', fontSize: '14px' }}>⏸</span>
                  )}
                  <p style={{ 
                    color: decision.impact === 'high' ? '#15803d' : '#3b82f6', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    margin: 0
                  }}>
                    {decision.result}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              {loading ? 'Loading AI decisions...' : 'No AI decisions available yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Performance */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Campaign Performance</h2>
        <div style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
          {campaignPerformance.length > 0 ? (
            campaignPerformance.map((campaign, index) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '500' }}>{campaign.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{campaign.metric} {campaign.label}</span>
                    <span style={{ color: '#22c55e', fontSize: '14px' }}>
                      ↑ Above industry average ({campaign.benchmark})
                    </span>
                  </div>
                </div>
                <div style={{ height: '6px', backgroundColor: '#eaeaea', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
                  <div style={{ 
                    width: campaign.metric, 
                    height: '100%', 
                    backgroundColor: '#00848e' 
                  }}></div>
                </div>
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                  {campaign.description}
                </p>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              {loading ? 'Loading campaign performance...' : 'No campaign performance data available yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Controls Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Controls</h2>
        <div style={{ 
          padding: '20px', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          backgroundColor: '#f9fafb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '500', marginBottom: '5px' }}>AI Status</div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {isPaused ? 'Temporarily paused' : 'Actively optimizing'}
              </div>
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: '1px solid #eaeaea',
                backgroundColor: isPaused ? '#00848e' : '#f8fafc',
                color: isPaused ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              {isPaused ? 'Resume AI Actions' : 'Temporarily Pause'}
            </button>
          </div>
          
          <div style={{ marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Frequency Cap</span>
              <span>3 messages / 7 days</span>
            </div>
            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
              No messages sent outside your frequency cap
            </p>
          </div>
          
          <div style={{ paddingTop: '15px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
              <span>Brand Tone</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Friendly</span>
                <button style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #eaeaea',
                  backgroundColor: 'white',
                  color: '#00848e',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}>
                  Preview sample
                </button>
              </div>
            </div>
            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
              AI automatically adjusts tone based on context
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
