'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Sparkles,
  HelpCircle,
  Check,
  Zap,
  X
} from 'lucide-react';

// Utility function for class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Card Component
function Card({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('bg-white text-gray-900 flex flex-col gap-6 rounded-xl border', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Button Component
function Button({ 
  className, 
  variant = 'default', 
  size = 'default',
  children,
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
    >
      {children}
    </button>
  );
}

// Badge Component
function Badge({
  className,
  variant = 'default',
  children,
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
    >
      {children}
    </span>
  );
}

// Modal Component
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface BillingDashboard {
  plan: {
    name: string;
    type: string;
    price_monthly: number;
    revenue_share_percentage: number;
    first_month_free: boolean;
  };
  billing_period: {
    first_month_free_active: boolean;
    first_month_days_remaining: number;
  };
  metrics: {
    recovered_revenue: number;
    billable_revenue: number;
    estimated_fee: number;
    base_monthly_fee: number;
  };
  show_upgrade_banner: boolean;
}

// Mock data - In production, this would come from API
const mockBillingData: BillingDashboard = {
  plan: {
    name: 'Starter',
    type: 'starter',
    price_monthly: 0,
    revenue_share_percentage: 8,
    first_month_free: true,
  },
  billing_period: {
    first_month_free_active: true,
    first_month_days_remaining: 22,
  },
  metrics: {
    recovered_revenue: 847.50,
    billable_revenue: 847.50,
    estimated_fee: 0,
    base_monthly_fee: 0,
  },
  show_upgrade_banner: true,
};

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingDashboard>(mockBillingData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showAttributionModal, setShowAttributionModal] = useState(false);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  const getShopDomain = () => {
    if (shopDomain) return shopDomain;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('shop');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('shop');
    setShopDomain(domain);
  }, []);

  useEffect(() => {
    const fetchStoreId = async () => {
      const currentShop = getShopDomain();
      
      if (!currentShop) {
        setLoading(false);
        setError('No shop domain provided');
        return;
      }
      
      try {
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(currentShop)}`);
        
        if (response.ok) {
          const data = await response.json();
          setStoreId(data.storeId);
        } else {
          setError('Failed to fetch store information');
          setLoading(false);
        }
      } catch (error) {
        setError('Error fetching store information');
        setLoading(false);
      }
    };
    
    fetchStoreId();
  }, [shopDomain]);

  useEffect(() => {
    const fetchBillingDashboard = async () => {
      if (!storeId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/billing/dashboard?store_id=${storeId}`);
        
        if (response.ok) {
          const data = await response.json();
          setBillingData(data);
          setError(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || 'Failed to load billing dashboard');
        }
      } catch (error) {
        setError('Failed to load billing dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillingDashboard();
  }, [storeId]);

  const handleUpgrade = async () => {
    if (!storeId) return;
    
    setIsUpgrading(true);
    try {
      const response = await fetch(`/api/billing/upgrade?store_id=${storeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const calculateSavings = (revenue: number) => {
    const starterCost = billingData.plan.price_monthly + (revenue * 0.08);
    const growthCost = 39 + (revenue * 0.05);
    return starterCost - growthCost;
  };

  const handleBackToDashboard = () => {
    if (shopDomain) {
      const host = new URLSearchParams(window.location.search).get('host') || '';
      window.location.href = `/?shop=${encodeURIComponent(shopDomain)}&host=${encodeURIComponent(host)}`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-500">Loading billing dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToDashboard} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upgrade Banner */}
        {billingData.show_upgrade_banner && billingData.plan.type === 'starter' && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upgrade to Save More
                  </h3>
                </div>
                <p className="text-gray-700 mb-3">
                  You&apos;ve recovered <span className="font-bold text-emerald-600">
                    {formatCurrency(billingData.metrics.recovered_revenue)}
                  </span> this month. Upgrade to Growth and pay less per dollar recovered.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Save {formatCurrency(calculateSavings(billingData.metrics.recovered_revenue))} with Growth plan</span>
                </div>
              </div>
              <Button 
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 whitespace-nowrap"
              >
                {isUpgrading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Upgrading...
                  </>
                ) : (
                  'Upgrade to Growth'
                )}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Current Plan Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
                <p className="text-sm text-gray-500">Your subscription details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {billingData.plan.name}
                  </span>
                  {billingData.plan.type === 'starter' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Free Tier
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${billingData.plan.price_monthly}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Revenue Share
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    {billingData.plan.revenue_share_percentage}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Applied to recovered revenue
                </p>
              </div>

              {/* First Month Free Indicator */}
              {billingData.billing_period.first_month_free_active && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎉</span>
                    <span className="font-semibold text-emerald-700">
                      First Month Free!
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-emerald-600">
                      {billingData.billing_period.first_month_days_remaining} days
                    </span>{' '}
                    remaining in your free trial
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* This Month Metrics Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">This Month</h2>
                <p className="text-sm text-gray-500">Current billing period</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Recovered Revenue */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Recovered Revenue
                  </span>
                  <button 
                    onClick={() => setShowAttributionModal(true)}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    How we calculate <HelpCircle className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(billingData.metrics.recovered_revenue)}
                </div>
              </div>

              {/* Base Monthly Fee */}
              {billingData.plan.price_monthly > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Base Monthly Fee
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(billingData.plan.price_monthly)}
                  </div>
                </div>
              )}

              {/* Revenue Share Fee */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Revenue Share Fee ({billingData.plan.revenue_share_percentage}%)
                  </span>
                </div>
                {billingData.billing_period.first_month_free_active ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-emerald-600">
                      FREE
                    </span>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      First Month
                    </Badge>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(billingData.metrics.recovered_revenue * (billingData.plan.revenue_share_percentage / 100))}
                  </div>
                )}
              </div>

              {/* Total Estimated */}
              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Total Estimated
                  </span>
                </div>
                {billingData.billing_period.first_month_free_active ? (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-emerald-600">
                      $0.00
                    </span>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      🎉 Free
                    </Badge>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(billingData.metrics.base_monthly_fee + billingData.metrics.estimated_fee)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Plan Comparison */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Plan Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Starter Plan */}
            <div className={cn(
              'p-6 rounded-lg border-2',
              billingData.plan.type === 'starter' 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-200 bg-white'
            )}>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Starter</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  + 8% of recovered revenue
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Up to 500 orders/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Basic analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Email support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Cart abandonment recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-emerald-600">First month free</span>
                </li>
              </ul>
            </div>

            {/* Growth Plan */}
            <div className={cn(
              'p-6 rounded-lg border-2',
              billingData.plan.type === 'growth' 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-200 bg-white'
            )}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-gray-900">Growth</h3>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                    ⭐ POPULAR
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">$39</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  + 5% of recovered revenue
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Unlimited orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Advanced analytics & insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">All recovery campaigns</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">A/B testing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Advanced AI personalization</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Billed through Shopify</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>No long-term contract</span>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Attribution Modal */}
      <Modal
        isOpen={showAttributionModal}
        onClose={() => setShowAttributionModal(false)}
        title="How We Calculate Revenue"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Recovered revenue includes orders that:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  Customer clicked an AI email
                </p>
                <p className="text-sm text-gray-500">
                  We track every click from your AI-generated campaigns
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  Purchased within 7 days
                </p>
                <p className="text-sm text-gray-500">
                  Attribution window from click to purchase
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  AI email was the last marketing touch
                </p>
                <p className="text-sm text-gray-500">
                  Last-touch attribution model ensures fair tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
