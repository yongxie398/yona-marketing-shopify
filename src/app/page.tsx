'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Grid3x3, 
  MoreVertical, 
  Settings, 
  CreditCard,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  Clock,
  Brain,
  Activity,
  CheckCircle,
  Plus,
  ShoppingCart,
  CreditCard as CreditCardIcon,
  Eye,
  Package,
  RefreshCw,
  Pause,
  Play,
  AlertCircle,
  PlayCircle,
  ArrowLeft,
  PauseCircle,
  Archive,
  BarChart3,
  Percent,
  Calendar
} from 'lucide-react';
import { ExperimentResults } from '@/components/ExperimentResults';
import FirstSaleCelebration from '@/components/FirstSaleCelebration';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MetricsGrid as MetricsGridComponent } from '@/components/MetricsGrid';
import { ActivityFeed as ActivityFeedComponent } from '@/components/ActivityFeed';
import { formatCompactCurrency, formatCompactNumber, formatRevenuePerRecipient, formatPercentage, convertUTCToLocalTime, getLocalDayName } from '@/utils/formatters';

// Types
export type TimeRange = 'today' | '7days' | '30days';
type AIStatus = 'active' | 'paused';

// Utility function for class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Default metrics data
// Button Component
function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<'button'> & {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  const variants = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'hover:bg-gray-100 text-gray-900',
    link: 'text-gray-900 underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md gap-1.5 px-3',
    lg: 'h-10 rounded-md px-6',
    icon: 'h-9 w-9 rounded-md',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

// Card Component
function Card({ className, highlight, ...props }: React.ComponentProps<'div'> & { highlight?: boolean }) {
  return (
    <div
      className={cn(
        'bg-white text-gray-900 flex flex-col gap-6 rounded-xl',
        highlight 
          ? 'border-2 border-emerald-500' 
          : 'border',
        className
      )}
      style={highlight ? undefined : { borderColor: 'rgba(0, 0, 0, 0.1)' }}
      {...props}
    />
  );
}

// Badge Component
function Badge({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'span'> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) {
  const variants = {
    default: 'bg-emerald-600 text-white border-transparent',
    secondary: 'bg-gray-100 text-gray-900 border-transparent',
    destructive: 'bg-red-600 text-white border-transparent',
    outline: 'border border-gray-200 bg-white text-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap gap-1',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// Progress Component
function Progress({ className, value, ...props }: React.ComponentProps<'div'> & { value: number }) {
  return (
    <div
      className={cn('bg-gray-200 relative h-2 w-full overflow-hidden rounded-full', className)}
      {...props}
    >
      <div
        className="bg-gray-900 h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}



// Tabs Components
function Tabs({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-gray-100 text-gray-600 inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px]',
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  active,
  ...props
}: React.ComponentProps<'button'> & { active?: boolean }) {
  return (
    <button
      className={cn(
        'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-4 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50',
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, hidden, ...props }: React.ComponentProps<'div'> & { hidden?: boolean }) {
  if (hidden) return null;
  return <div className={cn('flex-1 outline-none', className)} {...props} />;
}

// Dashboard Header Component
function DashboardHeader({ shopDomain }: { shopDomain?: string | null }) {
  const handleNavigateToDashboard = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('shop') || '';
    const host = urlParams.get('host') || '';
    window.location.href = `/?shop=${encodeURIComponent(domain)}&host=${encodeURIComponent(host)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleNavigateToDashboard}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
              <Grid3x3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Yona</span>
          </button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                const domain = urlParams.get('shop') || '';
                const host = urlParams.get('host') || '';
                window.location.href = `/billing?shop=${encodeURIComponent(domain)}&host=${encodeURIComponent(host)}`;
              }}
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Status Card Component
function StatusCard({ aiStatus, storeId, shopDomain }: { aiStatus: AIStatus; storeId?: string; shopDomain?: string | null }) {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    activeInterventions: 0,
    timeToFirstSale: '--'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatusMetrics() {
      if (!storeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch revenue metrics
        const revenueResponse = await fetch(
          `/api/analytics/revenue/${storeId}?timeRange=today`,
          { headers: { 'Content-Type': 'application/json' } }
        );

        let revenue = 0;
        if (revenueResponse.ok) {
          const revenueData = await revenueResponse.json();
          revenue = revenueData.attributed_revenue || 0;
        }

        // Fetch campaign performance for active interventions
        const campaignResponse = await fetch(
          `/api/analytics/campaign-performance/${storeId}?timeRange=today`,
          { headers: { 'Content-Type': 'application/json' } }
        );

        let activeInterventions = 0;
        if (campaignResponse.ok) {
          const campaignData = await campaignResponse.json();
          // Sum up emails sent today across all campaign types
          if (Array.isArray(campaignData)) {
            activeInterventions = campaignData.reduce((sum: number, campaign: any) => {
              return sum + (campaign.emails_sent || 0);
            }, 0);
          }
        }

        // Fetch first sale info
        let timeToFirstSale = '--';
        if (shopDomain) {
          try {
            const firstSaleResponse = await fetch(
              `/api/first-sale?shop=${encodeURIComponent(shopDomain)}`,
              { headers: { 'Content-Type': 'application/json' } }
            );
            if (firstSaleResponse.ok) {
              const firstSaleData = await firstSaleResponse.json();
              if (firstSaleData.isFirstSale) {
                timeToFirstSale = 'Pending';
              } else if (firstSaleData.timeToFirstSale) {
                // Use the calculated time to first sale from backend
                timeToFirstSale = firstSaleData.timeToFirstSale;
              } else if (firstSaleData.recoveredAt) {
                timeToFirstSale = 'Achieved';
              } else {
                timeToFirstSale = 'In Progress';
              }
            }
          } catch (e) {
            // Ignore first sale fetch errors
          }
        }

        setMetrics({
          revenue,
          activeInterventions,
          timeToFirstSale
        });
      } catch (error) {
        console.error('Error fetching status metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatusMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatusMetrics, 30000);
    return () => clearInterval(interval);
  }, [storeId]);

  const formatRevenue = (value: number) => {
    return formatCompactCurrency(value);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50" style={{ borderColor: '#a7f3d0' }}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">AI Revenue Agent</h2>
              <Badge 
                variant={aiStatus === 'active' ? 'default' : 'secondary'}
                className={cn('gap-1', aiStatus === 'active' && 'bg-green-600')}
              >
                <span className={cn('w-2 h-2 rounded-full', aiStatus === 'active' ? 'bg-green-200 animate-pulse' : 'bg-gray-400')} />
                {aiStatus === 'active' ? 'Working' : 'Paused'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {aiStatus === 'active' 
                ? 'Autonomously recovering revenue from abandoned shoppers' 
                : 'Revenue recovery paused'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border-2 border-emerald-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Revenue Recovered</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1 tabular-nums">
            {loading ? '-' : formatRevenue(metrics.revenue)}
          </div>
          <p className="text-xs text-gray-500">Today</p>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Interventions</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1 tabular-nums">
            {loading ? '-' : formatCompactNumber(metrics.activeInterventions)}
          </div>
          <p className="text-xs text-gray-500">
            {aiStatus === 'active' ? 'Monitoring shoppers' : 'Paused'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-purple-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Time to First Sale</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1" title={metrics.timeToFirstSale === 'In Progress' ? 'AI is actively working toward your first sale. Typically 3-7 days.' : ''}>
            {metrics.timeToFirstSale === 'In Progress' ? (
              <span className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                <span className="text-lg text-purple-600">Active</span>
              </span>
            ) : metrics.timeToFirstSale === 'Pending' ? (
              <span className="text-2xl text-gray-500">--</span>
            ) : metrics.timeToFirstSale === 'Achieved' ? (
              <span className="text-2xl text-emerald-600">✓</span>
            ) : (
              <span className="tabular-nums">{metrics.timeToFirstSale}</span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {metrics.timeToFirstSale === 'In Progress' ? 'Working toward first sale' : 
             metrics.timeToFirstSale === 'Pending' ? 'Waiting for first event' : 
             metrics.timeToFirstSale === 'Achieved' ? 'First sale recovered!' : 
             'First sale achieved'}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Metric Card Component
// Performance Chart Component
function PerformanceChart({ timeRange, storeId }: { timeRange: TimeRange; storeId?: string }) {
  const [data, setData] = useState<Array<{ time: string; revenue: number; emails: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      if (!storeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/analytics/performance-chart/${storeId}?timeRange=${timeRange}`
        );

        if (response.ok) {
          const chartData = await response.json();
          // Convert time format based on timeRange
          const localData = chartData.map((item: { time: string; revenue: number; emails: number }) => ({
            ...item,
            time: timeRange === 'today' 
              ? convertUTCToLocalTime(item.time)  // HH:MM format
              : timeRange === '7days'
                ? getLocalDayName(item.time)  // Convert ISO date to local day name
                : item.time  // '30days' - Week labels, no conversion needed
          }));
          setData(localData);
        } else {
          // Fallback to empty data on error
          setData([]);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, [storeId, timeRange]);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
        <p className="text-sm text-gray-500 mt-1">Revenue and email engagement trends</p>
      </div>
      
      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No data available yet</p>
            <p className="text-sm text-gray-400">Activity will appear here when customers engage</p>
          </div>
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#3b82f6"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#8b5cf6"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'Revenue ($)') {
                return [`$${value}`, name];
              }
              return [value, name];
            }}
          />
          <Legend />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            stroke="#3b82f6" 
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={2}
            name="Revenue ($)"
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="emails" 
            stroke="#8b5cf6" 
            fillOpacity={1}
            fill="url(#colorEmails)"
            strokeWidth={2}
            name="Emails Sent"
          />
        </AreaChart>
      </ResponsiveContainer>
      )}
    </Card>
  );
}

// AI Controls Component
function AIControls({ aiStatus, setAiStatus, storeId, timeRange }: { aiStatus: AIStatus; setAiStatus: (status: AIStatus) => void; storeId?: string; timeRange: TimeRange }) {
  const [performance, setPerformance] = useState({
    decision_speed_seconds: 0,
    learning_rate_percent: 0,
    total_decisions: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchPerformance() {
      if (!storeId) {
        setPerformance(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setPerformance(prev => ({ ...prev, loading: true }));
        const response = await fetch(
          `/api/ai/agent-performance/${storeId}?timeRange=${timeRange}`
        );

        if (response.ok) {
          const data = await response.json();
          setPerformance({
            decision_speed_seconds: data.decision_speed_seconds || 0,
            learning_rate_percent: data.learning_rate_percent || 0,
            total_decisions: data.total_decisions || 0,
            loading: false
          });
        } else {
          setPerformance(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error fetching agent performance:', error);
        setPerformance(prev => ({ ...prev, loading: false }));
      }
    }

    fetchPerformance();
  }, [storeId, timeRange]);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Agent Controls</h3>
        <p className="text-sm text-gray-500 mt-1">Minimal settings, maximum autonomy</p>
      </div>

      <div className="space-y-6">
        {/* Status Control Bar */}
        <div className="p-4 border-2 border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${aiStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">Agent Status:</span>
              <span className={`text-sm font-semibold ${aiStatus === 'active' ? 'text-emerald-600' : 'text-gray-600'}`}>
                {aiStatus === 'active' ? 'Working' : 'Paused'}
              </span>
            </div>
            <Button
              size="sm"
              variant={aiStatus === 'active' ? 'destructive' : 'default'}
              onClick={() => setAiStatus(aiStatus === 'active' ? 'paused' : 'active')}
              className="gap-2"
            >
              {aiStatus === 'active' ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Resume
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            {aiStatus === 'active'
              ? 'Autonomously monitoring and recovering revenue'
              : 'All revenue recovery paused'}
          </p>
        </div>

        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => {
            const urlParams = new URLSearchParams(window.location.search);
            const domain = urlParams.get('shop') || '';
            const host = urlParams.get('host') || '';
            window.location.href = `/settings?shop=${encodeURIComponent(domain)}&host=${encodeURIComponent(host)}`;
          }}
        >
          <Settings className="w-4 h-4" />
          Configure Agent
        </Button>

        <div className="pt-4 border-t border-gray-200 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Agent Performance</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="text-xs text-emerald-700 font-medium">Decision Speed</div>
              <div className="text-xl font-bold text-emerald-900 mt-1">
                {performance.loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${performance.decision_speed_seconds.toFixed(1)}s`
                )}
              </div>
              <div className="text-xs text-emerald-600 mt-1">Avg response time</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-700 font-medium">Learning Rate</div>
              <div className="text-xl font-bold text-blue-900 mt-1">
                {performance.loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${performance.learning_rate_percent >= 0 ? '+' : ''}${performance.learning_rate_percent.toFixed(1)}%`
                )}
              </div>
              <div className="text-xs text-blue-600 mt-1">Improvement/week</div>
            </div>
          </div>
          {!performance.loading && performance.total_decisions > 0 && (
            <p className="text-xs text-gray-500 text-center">
              Based on {performance.total_decisions} decisions
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Attribution Model</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Last AI-touch attribution</div>
            <div>• 7-day conversion window</div>
            <div>• Revenue = incremental only</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Insights Panel Component
function InsightsPanel({ timeRange, storeId }: { timeRange: TimeRange; storeId?: string }) {
  const [insights, setInsights] = useState<Array<{ id: string; type: string; title: string; description: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      if (!storeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/ai/insights/${storeId}?timeRange=${timeRange}`
        );

        if (response.ok) {
          const data = await response.json();
          setInsights(data);
        } else {
          // Fallback to default insights on error
          setInsights([
            {
              id: '1',
              type: 'learning',
              title: 'AI Learning Active',
              description: 'Agent is continuously improving send timing based on your customers\' behavior patterns.'
            },
            {
              id: '2',
              type: 'info',
              title: 'Optimal Timing Detected',
              description: 'AI analyzes customer engagement patterns to determine the best time to send messages.'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        setInsights([
          {
            id: '1',
            type: 'learning',
            title: 'AI Learning Active',
            description: 'Agent is continuously improving send timing based on your customers\' behavior patterns.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [storeId, timeRange]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'info':
        return <Activity className="w-4 h-4" />;
      case 'learning':
        return <Brain className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'learning':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-100 bg-gray-50 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={cn('p-4 rounded-lg border', getInsightColor(insight.type))}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">What AI Does Autonomously</h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5" />
            <p className="text-xs text-gray-600">Observes shopper behavior in real-time</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5" />
            <p className="text-xs text-gray-600">Decides optimal intervention timing & content</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5" />
            <p className="text-xs text-gray-600">Respects frequency caps & prevents fatigue</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5" />
            <p className="text-xs text-gray-600">Learns from results & improves continuously</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [aiStatus, setAiStatus] = useState<AIStatus>('active');
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'abtesting'>('overview');
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFirstSale, setShowFirstSale] = useState(false);
  const hasShownCelebration = useRef(false);
  const [firstSaleData, setFirstSaleData] = useState({
    saleAmount: 0,
    customerName: 'Customer',
    recoveryTime: 'Just now',
    campaign: 'Cart Recovery',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');
    const billing = urlParams.get('billing');
    const billingMessage = urlParams.get('message');
    const host = urlParams.get('host');
    const onboardingStep = urlParams.get('onboarding');
    
    // Debug logging for billing callback
    console.log('[Billing Debug] URL params:', {
      shop,
      billing,
      billingMessage,
      host,
      onboardingStep,
      fullUrl: window.location.href,
      search: window.location.search
    });
    
    setShopDomain(shop);
    setLoading(false);

    // Note: Billing callback redirect is now handled by auth callback using onboarding_step
    // The auth callback checks the store's onboarding_step and redirects accordingly
    // This ensures proper flow even when URL parameters are not preserved

    // Check if celebration was already shown in this session
    const sessionKey = shop ? `celebration-shown-${shop}` : null;
    if (sessionKey && sessionStorage.getItem(sessionKey)) {
      console.log('Celebration already shown in this session, skipping...');
      hasShownCelebration.current = true;
    } else {
      console.log('Celebration not shown yet in this session');
    }

    // Check for first sale celebration once on page load (no polling)
    if (shop) {
      checkFirstSale(shop);
    }
  }, []);

  // Fetch store info and check onboarding status when shopDomain is available
  useEffect(() => {
    async function fetchStoreInfo() {
      if (!shopDomain) return;
      
      try {
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        if (response.ok) {
          const data = await response.json();
          setStoreId(data.storeId);
          
          // Check onboarding status and redirect if needed
          console.log('[Onboarding Debug] Store info:', {
            onboardingComplete: data.onboardingComplete,
            brandTone: data.brandTone,
            shop: shopDomain
          });
          
          // If onboarding is not complete and we're on the dashboard, redirect to onboarding
          if (!data.onboardingComplete) {
            const urlParams = new URLSearchParams(window.location.search);
            const currentPath = window.location.pathname;
            const host = urlParams.get('host') || '';
            
            console.log('[Onboarding Debug] Onboarding incomplete, current path:', currentPath);
            
            // Only redirect if we're on the main dashboard page (not already in onboarding)
            if (currentPath === '/' || currentPath === '') {
              // Check if brand voice is set (indicates brand voice page is done)
              if (data.brandTone && data.brandTone !== 'friendly') {
                // Brand voice is set, go to AI Live onboarding
                console.log('[Onboarding Debug] Redirecting to AI Live onboarding');
                window.location.href = `/onboarding/ai-live?shop=${encodeURIComponent(shopDomain)}&host=${encodeURIComponent(host)}`;
              }
              // Note: We don't auto-redirect to plan-selection or brand-voice here
              // because we can't distinguish between:
              // 1. New store that needs plan selection
              // 2. Store that just completed billing and needs brand voice
              // The auth callback handles the initial redirect to plan-selection
              // and the billing callback URL parameters should handle the brand-voice redirect
            }
          }
        }
      } catch (error) {
        console.error('Error fetching store info:', error);
      }
    }
    
    fetchStoreInfo();
  }, [shopDomain]);

  const checkFirstSale = async (shop: string): Promise<boolean> => {
    // Skip if already shown celebration in this session
    if (hasShownCelebration.current) {
      console.log('Skipping checkFirstSale - already shown in this session');
      return true; // Return true to stop polling
    }
    console.log('checkFirstSale running for shop:', shop);
    
    try {
      console.log('Checking first sale for shop:', shop);
      const response = await fetch(`/api/first-sale?shop=${encodeURIComponent(shop)}`);
      console.log('First sale API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('First sale data:', data);
        
        if (data.isFirstSale) {
          console.log('First sale detected! Showing celebration...');
          setFirstSaleData({
            saleAmount: data.saleAmount,
            customerName: data.customerName,
            recoveryTime: data.recoveryTime,
            campaign: data.campaign,
          });
          setShowFirstSale(true);
          hasShownCelebration.current = true; // Mark as shown in this session
          // Store in sessionStorage to persist across re-renders
          sessionStorage.setItem(`celebration-shown-${shop}`, 'true');
          // Mark celebration as shown on backend
          try {
            const postResponse = await fetch(`/api/first-sale?shop=${encodeURIComponent(shop)}`, {
              method: 'POST',
            });
            if (postResponse.ok) {
              console.log('Successfully marked celebration as shown on backend');
            } else {
              console.error('Failed to mark celebration as shown on backend:', postResponse.status);
            }
          } catch (postError) {
            console.error('Error marking celebration as shown:', postError);
          }
        } else {
          console.log('Not a first sale or already shown');
        }
        return true; // API call succeeded
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('First sale API error:', response.status, errorData);
        return false; // API returned error
      }
    } catch (error) {
      console.error('Error checking first sale:', error);
      return false; // Network or other error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader shopDomain={shopDomain} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatusCard aiStatus={aiStatus} storeId={storeId} shopDomain={shopDomain} />
        
        <Tabs className="mt-8">
          <TabsList>
            <TabsTrigger 
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              active={activeTab === 'campaigns'}
              onClick={() => setActiveTab('campaigns')}
            >
              Campaigns
            </TabsTrigger>
            <TabsTrigger 
              active={activeTab === 'abtesting'}
              onClick={() => setActiveTab('abtesting')}
            >
              A/B Testing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent hidden={activeTab !== 'overview'} className="mt-6">
            <div className="flex gap-2 border-b border-gray-200">
              {[
                { value: 'today', label: 'Today' },
                { value: '7days', label: '7 days' },
                { value: '30days', label: '30 days' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as TimeRange)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors',
                    timeRange === option.value
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <MetricsGridComponent timeRange={timeRange} storeId={storeId || undefined} />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
              <div className="space-y-6">
                <PerformanceChart timeRange={timeRange} storeId={storeId || undefined} />
                <ActivityFeedComponent aiStatus={aiStatus} storeId={storeId || undefined} />
                <InsightsPanel timeRange={timeRange} storeId={storeId || undefined} />
              </div>

              <div className="space-y-6">
                <AIControls aiStatus={aiStatus} setAiStatus={setAiStatus} storeId={storeId || undefined} timeRange={timeRange} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent hidden={activeTab !== 'campaigns'} className="mt-6">
            <div className="flex gap-2 border-b border-gray-200 mb-6">
              {[
                { value: 'today', label: 'Today' },
                { value: '7days', label: '7 days' },
                { value: '30days', label: '30 days' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as TimeRange)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors',
                    timeRange === option.value
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <CampaignPerformance timeRange={timeRange} storeId={storeId || undefined} />
          </TabsContent>

          <TabsContent hidden={activeTab !== 'abtesting'} className="mt-6">
            <ABTestingOverview timeRange={timeRange} storeId={storeId || undefined} />
          </TabsContent>
        </Tabs>


      </main>

      {/* First Sale Celebration */}
      <FirstSaleCelebration
        open={showFirstSale}
        onClose={() => setShowFirstSale(false)}
        saleAmount={firstSaleData.saleAmount}
        customerName={firstSaleData.customerName}
        recoveryTime={firstSaleData.recoveryTime}
        campaign={firstSaleData.campaign}
      />
    </div>
  );
}

// Campaign Performance Component
function CampaignPerformance({ timeRange, storeId }: { timeRange: TimeRange; storeId?: string }) {
  const [campaigns, setCampaigns] = useState<Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
    trigger: string;
    status: 'active' | 'learning';
    sent: number;
    conversions: number;
    revenue: number;
    revenuePerRecipient: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      if (!storeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/analytics/campaign-performance/${storeId}?timeRange=${timeRange}`
        );

        if (response.ok) {
          const data = await response.json();
          // Map backend data to frontend format
          const mappedCampaigns = data.map((c: any) => ({
            id: c.campaign_type,
            name: getCampaignName(c.campaign_type),
            icon: getCampaignIcon(c.campaign_type),
            trigger: getCampaignTrigger(c.campaign_type),
            status: c.conversion_rate > 15 ? 'active' as const : 'learning' as const,
            sent: c.emails_sent,
            conversions: c.conversions,
            revenue: c.revenue_generated,
            revenuePerRecipient: c.emails_sent > 0 ? c.revenue_generated / c.emails_sent : 0,
          }));
          setCampaigns(mappedCampaigns);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, [storeId, timeRange]);

  const getCampaignName = (type: string) => {
    const names: Record<string, string> = {
      cart_abandonment: 'Cart Abandonment',
      checkout_abandonment: 'Checkout Abandonment',
      browse_abandonment: 'Browse Abandonment',
      post_purchase: 'Post-Purchase',
      repeat_purchase: 'Repeat Purchase',
      default: 'Default Campaign'
    };
    return names[type] || type;
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'cart_abandonment':
        return <ShoppingCart className="w-5 h-5" />;
      case 'checkout_abandonment':
        return <CreditCardIcon className="w-5 h-5" />;
      case 'browse_abandonment':
        return <Eye className="w-5 h-5" />;
      case 'post_purchase':
        return <Package className="w-5 h-5" />;
      case 'repeat_purchase':
        return <RefreshCw className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getCampaignTrigger = (type: string) => {
    const triggers: Record<string, string> = {
      cart_abandonment: 'Cart created, not checked out',
      checkout_abandonment: 'Checkout started, not completed',
      browse_abandonment: 'Product viewed 2+ times',
      post_purchase: 'Order completed',
      repeat_purchase: 'X days after purchase',
      default: 'Triggered by AI'
    };
    return triggers[type] || 'AI triggered';
  };

  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const avgRevenuePerRecipient = totalSent > 0 ? totalRevenue / totalSent : 0;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Autonomous Campaigns</h3>
        <p className="text-sm text-gray-500 mt-1">AI decides which campaign to trigger for each shopper</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 border border-gray-100 rounded-lg bg-gray-50 animate-pulse h-48" />
            ))}
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-blue-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Yet</h4>
          <p className="text-sm text-gray-500">Campaign data will appear here once AI starts sending messages.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div>
              <div className="text-xs font-medium text-emerald-700 mb-1">TOTAL REVENUE</div>
              <div className="text-2xl font-bold text-emerald-900 tabular-nums">{formatCompactCurrency(totalRevenue)}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-emerald-700 mb-1">TOTAL SENT</div>
              <div className="text-2xl font-bold text-emerald-900 tabular-nums">{formatCompactNumber(totalSent)}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-emerald-700 mb-1">AVG PER RECIPIENT</div>
              <div className="text-2xl font-bold text-emerald-900 tabular-nums">{formatRevenuePerRecipient(avgRevenuePerRecipient)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {campaigns.map((campaign) => {
          const conversionRate = campaign.sent > 0 
            ? ((campaign.conversions / campaign.sent) * 100).toFixed(1) 
            : '0.0';

          return (
            <div key={campaign.id} className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {campaign.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{campaign.trigger}</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={campaign.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-purple-50 text-purple-700 border-purple-200'}
                >
                  {campaign.status === 'active' ? 'Active' : 'Learning'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Revenue Recovered</div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {formatCompactCurrency(campaign.revenue)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Per Recipient</div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {formatRevenuePerRecipient(campaign.revenuePerRecipient)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{formatPercentage(parseFloat(conversionRate))}</span>
                  </div>
                  <Progress value={parseFloat(conversionRate)} />
                </div>

                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Sent</div>
                    <div className="font-semibold text-gray-900 tabular-nums">{formatCompactNumber(campaign.sent)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Conversions</div>
                    <div className="font-semibold text-gray-900 tabular-nums">{formatCompactNumber(campaign.conversions)}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
          </div>
        </>
      )}
    </Card>
  );
}

// Experiment Card Component
function ExperimentCard({ 
  experiment, 
  onClick 
}: { 
  experiment: {
    id: string;
    name: string;
    description: string;
    status: 'running' | 'paused' | 'completed' | 'draft' | 'archived';
    targetEvent: string;
    trafficAllocation: number;
    primaryMetric: 'revenue' | 'conversion_rate' | 'aov';
    control: { users: number; conversions: number; revenue: number; conversionRate: number; revenuePerUser: number };
    treatment: { users: number; conversions: number; revenue: number; conversionRate: number; revenuePerUser: number };
    statistics: { lift: number; pValue: number; confidenceLevel: number; isSignificant: boolean };
    daysRunning: number;
  };
  onClick: () => void;
}) {
  const isPositiveLift = experiment.statistics.lift > 0;
  const needsMoreData = experiment.daysRunning < 7 || 
    (experiment.control.conversions + experiment.treatment.conversions) < 200;

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      running: 'bg-green-600',
      paused: 'bg-yellow-600',
      completed: 'bg-blue-600',
      draft: 'bg-gray-500',
      archived: 'bg-gray-400'
    };
    const style = statusStyles[status] || 'bg-gray-400';
    return (
      <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium text-white ${style}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getConfidenceColor = (confidenceLevel: number) => {
    if (confidenceLevel >= 95) return 'text-green-700 bg-green-50 border-green-200';
    if (confidenceLevel >= 80) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'revenue':
        return 'Revenue per User';
      case 'conversion_rate':
        return 'Conversion Rate';
      case 'aov':
        return 'Avg Order Value';
      default:
        return metric;
    }
  };

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{experiment.name}</h3>
              {getStatusBadge(experiment.status)}
            </div>
            <p className="text-sm text-gray-600">{experiment.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>Target: {experiment.targetEvent.replace(/_/g, ' ')}</span>
              <span>•</span>
              <span>Split: {experiment.trafficAllocation}/{100 - experiment.trafficAllocation}</span>
              <span>•</span>
              <span>{experiment.daysRunning} days running</span>
            </div>
          </div>

          {/* Lift Badge */}
          <div className={`px-4 py-3 rounded-lg text-center min-w-[120px] ${
            experiment.statistics.isSignificant 
              ? isPositiveLift ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
              : 'bg-gray-50 border-2 border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              {isPositiveLift ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-2xl font-bold ${
                experiment.statistics.isSignificant
                  ? isPositiveLift ? 'text-green-900' : 'text-red-900'
                  : 'text-gray-700'
              }`}>
                {isPositiveLift ? '+' : ''}{experiment.statistics.lift.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-600 font-medium">Lift</div>
          </div>
        </div>

        {/* Metrics Comparison */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Control */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-3">CONTROL</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">{getMetricLabel(experiment.primaryMetric)}</div>
                <div className="text-lg font-bold text-gray-900">
                  {experiment.primaryMetric === 'revenue' || experiment.primaryMetric === 'aov'
                    ? `$${experiment.control.revenuePerUser.toFixed(2)}`
                    : `${experiment.control.conversionRate.toFixed(1)}%`}
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="w-3 h-3" />
                  {experiment.control.users.toLocaleString()} users
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <Target className="w-3 h-3" />
                  {experiment.control.conversions.toLocaleString()} conversions
                </div>
              </div>
            </div>
          </div>

          {/* Treatment */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-3">TREATMENT (AI)</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">{getMetricLabel(experiment.primaryMetric)}</div>
                <div className="text-lg font-bold text-blue-900">
                  {experiment.primaryMetric === 'revenue' || experiment.primaryMetric === 'aov'
                    ? `$${experiment.treatment.revenuePerUser.toFixed(2)}`
                    : `${experiment.treatment.conversionRate.toFixed(1)}%`}
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="w-3 h-3" />
                  {experiment.treatment.users.toLocaleString()} users
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <Target className="w-3 h-3" />
                  {experiment.treatment.conversions.toLocaleString()} conversions
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Significance */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-3">STATISTICAL CONFIDENCE</div>
            <div className={`p-3 rounded-lg border ${getConfidenceColor(experiment.statistics.confidenceLevel)}`}>
              <div className="flex items-center gap-2 mb-2">
                {experiment.statistics.isSignificant ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="font-bold text-lg">
                  {experiment.statistics.confidenceLevel.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs mb-2">
                {experiment.statistics.isSignificant ? 'Significant' : 'Not significant'}
              </div>
              <div className="text-xs opacity-80">
                p-value: {experiment.statistics.pValue.toFixed(4)}
              </div>
            </div>
          </div>
        </div>

        {/* Warning if needs more data */}
        {needsMoreData && experiment.status === 'running' && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-semibold">Collecting data:</span> Need 
              {experiment.daysRunning < 7 && ` ${7 - experiment.daysRunning} more days`}
              {experiment.daysRunning < 7 && (experiment.control.conversions + experiment.treatment.conversions) < 200 && ' and'}
              {(experiment.control.conversions + experiment.treatment.conversions) < 200 && 
                ` ${200 - (experiment.control.conversions + experiment.treatment.conversions)} more conversions`} 
              {' '}for reliable results
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// A/B Testing Overview Component
function ABTestingOverview({ timeRange, storeId }: { timeRange: TimeRange; storeId?: string }) {
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [experiments, setExperiments] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    running_count: 0,
    completed_count: 0,
    total_revenue_lift: 0,
    average_lift: 0
  });

  useEffect(() => {
    async function fetchExperiments() {
      if (!storeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/experiments/${storeId}?timeRange=${timeRange}`
        );

        if (response.ok) {
          const data = await response.json();
          setExperiments(data.experiments || []);
          setSummary({
            total: data.total || 0,
            running_count: data.running_count || 0,
            completed_count: data.completed_count || 0,
            total_revenue_lift: data.total_revenue_lift || 0,
            average_lift: data.average_lift || 0
          });
        } else {
          setExperiments([]);
        }
      } catch (error) {
        console.error('Error fetching experiments:', error);
        setExperiments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchExperiments();
  }, [storeId, timeRange]);

  const runningExperiments = experiments.filter(e => e.status === 'running');
  const completedExperiments = experiments.filter(e => e.status === 'completed');

  // Use summary data from API
  const totalRevenueLift = summary.total_revenue_lift;
  const avgLift = summary.average_lift || 0;

  if (selectedExperiment) {
    const experiment = experiments.find(e => e.id === selectedExperiment);
    if (experiment) {
      const revenueDiff = experiment.treatment.revenue - experiment.control.revenue;
      const isPositiveLift = experiment.statistics.lift > 0;

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedExperiment(null)}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{experiment.name}</h1>
                <p className="text-sm text-gray-600 mt-1">{experiment.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {experiment.status === 'running' && (
                <>
                  <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                    <AlertCircle className="w-4 h-4" />
                    Stop
                  </button>
                </>
              )}
              {experiment.status === 'paused' && (
                <button className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}
            </div>
          </div>

          {/* Key Results */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`p-5 border-2 ${
              experiment.statistics.isSignificant
                ? isPositiveLift ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isPositiveLift ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-medium text-gray-700">Lift</span>
              </div>
              <div className={`text-4xl font-bold ${
                experiment.statistics.isSignificant
                  ? isPositiveLift ? 'text-green-900' : 'text-red-900'
                  : 'text-gray-700'
              }`}>
                {isPositiveLift ? '+' : ''}{experiment.statistics.lift.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {experiment.statistics.isSignificant ? 'Statistically significant' : 'Not yet significant'}
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Revenue Impact</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {revenueDiff >= 0 ? '+' : ''}${revenueDiff.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-2">Incremental revenue</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Confidence</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {experiment.statistics.confidenceLevel.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600 mt-2">
                p-value: {experiment.statistics.pValue.toFixed(4)}
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Sample Size</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {(experiment.control.users + experiment.treatment.users).toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-2">Total users in test</p>
            </Card>
          </div>

          {/* Experiment Validity Checklist */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Experiment Validity Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                {experiment.daysRunning >= 7 ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">Minimum Runtime</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {experiment.daysRunning} / 7 days
                    {experiment.daysRunning >= 7 && ' ✓'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {(experiment.control.conversions + experiment.treatment.conversions) >= 200 ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">Sample Size</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {experiment.control.conversions + experiment.treatment.conversions} / 200 conversions
                    {(experiment.control.conversions + experiment.treatment.conversions) >= 200 && ' ✓'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {experiment.statistics.pValue < 0.05 ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">Statistical Significance</div>
                  <div className="text-xs text-gray-600 mt-1">
                    p &lt; 0.05 {experiment.statistics.pValue < 0.05 && '✓'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Control Group */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Control Group</h3>
                <Badge variant="outline">Baseline</Badge>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Users</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {experiment.control.users.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Conversions</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {experiment.control.conversions.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-700 mb-1">Conversion Rate</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {experiment.control.conversionRate.toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-xs text-emerald-700 mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold text-emerald-900">
                    ${experiment.control.revenue.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-xs text-purple-700 mb-1">Revenue per User</div>
                  <div className="text-3xl font-bold text-purple-900">
                    ${experiment.control.revenuePerUser.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>

            {/* Treatment Group */}
            <Card className="p-6 border-2 border-blue-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Treatment Group</h3>
                <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium text-white bg-blue-600">
                  AI Enhanced
                </span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-700 mb-1">Users</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {experiment.treatment.users.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-700 mb-1">Conversions</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {experiment.treatment.conversions.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
                  <div className="text-xs text-blue-700 mb-1">Conversion Rate</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {experiment.treatment.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {isPositiveLift ? '+' : ''}{(experiment.treatment.conversionRate - experiment.control.conversionRate).toFixed(1)}% vs control
                  </div>
                </div>
                <div className="p-4 bg-emerald-100 border-2 border-emerald-300 rounded-lg">
                  <div className="text-xs text-emerald-700 mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold text-emerald-900">
                    ${experiment.treatment.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">
                    {revenueDiff >= 0 ? '+' : ''}${revenueDiff.toLocaleString()} vs control
                  </div>
                </div>
                <div className="p-4 bg-purple-100 border-2 border-purple-300 rounded-lg">
                  <div className="text-xs text-purple-700 mb-1">Revenue per User</div>
                  <div className="text-3xl font-bold text-purple-900">
                    ${experiment.treatment.revenuePerUser.toFixed(2)}
                  </div>
                  <div className="text-xs text-purple-700 mt-1">
                    {isPositiveLift ? '+' : ''}${(experiment.treatment.revenuePerUser - experiment.control.revenuePerUser).toFixed(2)} vs control
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </Card>
          ))}
        </div>
        {/* Content Skeleton */}
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
            <div className="space-y-3 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Active Tests</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{runningExperiments.length}</div>
          <p className="text-xs text-gray-500 mt-1">Currently running</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Completed</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{completedExperiments.length}</div>
          <p className="text-xs text-gray-500 mt-1">With significant results</p>
        </Card>

        <Card className="p-5 border-2 border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Revenue Impact</span>
          </div>
          <div className="text-3xl font-bold text-emerald-900">
            ${totalRevenueLift.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-700 mt-1">Incremental lift detected</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Avg Lift</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">+{avgLift.toFixed(1)}%</div>
          <p className="text-xs text-gray-500 mt-1">AI improvement rate</p>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Experiments</h2>
            <p className="text-sm text-gray-500 mt-1">
              Scientifically measure AI impact with statistical rigor
            </p>
          </div>
          <button 
            onClick={() => setCreateDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Experiment
          </button>
        </div>

        {/* Running Experiments */}
        {runningExperiments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <PlayCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Running</h3>
              <Badge className="bg-green-600">{runningExperiments.length}</Badge>
            </div>
            <div className="space-y-4">
              {runningExperiments.map(experiment => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  onClick={() => setSelectedExperiment(experiment.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Experiments */}
        {completedExperiments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
              <Badge variant="outline">{completedExperiments.length}</Badge>
            </div>
            <div className="space-y-4">
              {completedExperiments.map(experiment => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  onClick={() => setSelectedExperiment(experiment.id)}
                />
              ))}
            </div>
          </div>
        )}

        {experiments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Start testing AI improvements with statistical rigor
            </p>
            <button 
              onClick={() => setCreateDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Experiment
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
