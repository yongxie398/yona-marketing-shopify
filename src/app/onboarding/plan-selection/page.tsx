'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  revenue_share_percentage: number;
  free_tier_amount: number;
  is_recommended: boolean;
  features: string[];
}

const PLANS_DATA: Plan[] = [
  {
    id: 'starter',
    slug: 'starter',
    name: 'Starter',
    price_monthly: 29,
    description: 'Perfect for growing stores',
    is_recommended: false,
    features: [
      'Up to 500 orders/month',
      'Basic analytics dashboard',
      'Email support',
      'Standard email templates',
      'Cart abandonment recovery',
    ],
    revenue_share_percentage: 0,
    free_tier_amount: 0,
  },
  {
    id: 'growth',
    slug: 'growth',
    name: 'Growth',
    price_monthly: 79,
    description: 'Best for scaling businesses',
    is_recommended: true,
    features: [
      'Unlimited orders',
      'Advanced analytics & insights',
      'Priority support',
      'Custom email templates',
      'All recovery campaigns',
      'A/B testing',
      'Advanced AI personalization',
    ],
    revenue_share_percentage: 0,
    free_tier_amount: 0,
  },
];

// Check icon component (lucide-react style)
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// Dollar sign icon component (lucide-react style)
function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

// Trending up icon component (lucide-react style)
function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

// Zap icon component (lucide-react style)
function ZapIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

// Shield icon component (lucide-react style)
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

// Lightning bolt logo component
function LogoIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

// Card component matching ui_prototype
function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`bg-white text-gray-900 flex flex-col gap-6 rounded-xl border ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Button component - matches ui_prototype exactly
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white hover:bg-emerald-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100 text-gray-900",
        link: "text-gray-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6 text-base",
        icon: "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// Input component matching ui_prototype
function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={`flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-base transition-[color,box-shadow] outline-none focus-visible:border-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900/20 hover:border-gray-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className || ''}`}
      {...props}
    />
  );
}

export default function PlanSelectionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selecting, setSelecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('growth');
  const [projectedRevenue, setProjectedRevenue] = useState<string>('2000');
  const searchParams = useSearchParams();

  const currentStep = 1;
  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Get shop domain from URL
  useEffect(() => {
    const shop = searchParams.get('shop');
    setShopDomain(shop);
  }, [searchParams]);

  // Fetch store ID
  useEffect(() => {
    const fetchStoreId = async () => {
      if (!shopDomain) return;

      try {
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        if (response.ok) {
          const data = await response.json();
          setStoreId(data.storeId);
        }
      } catch (error) {
        console.error('Error fetching store ID:', error);
      }
    };

    fetchStoreId();
  }, [shopDomain]);

  // Fetch plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('/api/billing/plans', {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        } else {
          setPlans(PLANS_DATA);
        }
      } catch (err: any) {
        console.error('Error fetching plans:', err);
        setPlans(PLANS_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = async (planSlug: string) => {
    if (!storeId) {
      setError('Store information not available');
      return;
    }

    setSelecting(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: storeId,
          plan_slug: planSlug,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.confirmation_url) {
          window.location.href = data.confirmation_url;
          return;
        }

        if (shopDomain) {
          const host = new URLSearchParams(window.location.search).get('host') || '';
          const redirectUrl = `/onboarding/brand-voice?shop=${encodeURIComponent(shopDomain)}&host=${encodeURIComponent(host)}`;
          window.location.href = redirectUrl;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to select plan');
      }
    } catch (err) {
      setError('Error selecting plan');
      console.error('Error selecting plan:', err);
    } finally {
      setSelecting(false);
    }
  };

  const handleContinue = () => {
    handleSelectPlan(selectedPlan);
  };

  const revenue = parseFloat(projectedRevenue) || 0;
  const potentialRecovery = Math.round(revenue * 0.30);
  const recommendedPlan = revenue < 1000 ? 'starter' : 'growth';

  // Auto-select the recommended plan when revenue changes
  useEffect(() => {
    if (revenue > 0) {
      setSelectedPlan(recommendedPlan);
    }
  }, [revenue, recommendedPlan]);

  const displayPlans = plans.length > 0 ? plans : PLANS_DATA;
  const starterPlan = displayPlans.find(p => p.slug === 'starter') || PLANS_DATA[0];
  const growthPlan = displayPlans.find(p => p.slug === 'growth') || PLANS_DATA[1];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        {/* Progress Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <LogoIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Yona AI Revenue Agent</h3>
                  <p className="text-xs text-gray-500">Quick Setup</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">Step {currentStep} of {totalSteps}</span>
                <p className="text-xs text-gray-500">{Math.round(progressPercentage)}% Complete</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <LogoIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Yona AI Revenue Agent</h3>
                <p className="text-xs text-gray-500">Quick Setup</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">Step {currentStep} of {totalSteps}</span>
              <p className="text-xs text-gray-500">{Math.round(progressPercentage)}% Complete</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gray-900 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Select the plan that fits your business needs</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Starter Plan */}
            <Card
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedPlan === 'starter'
                  ? 'border-2 border-emerald-500 shadow-lg'
                  : 'border-2 border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div onClick={() => setSelectedPlan('starter')}>
                {/* Recommended Badge */}
                {recommendedPlan === 'starter' && (
                  <div className="flex justify-end mb-2">
                    <span className="inline-flex items-center justify-center rounded-md border-transparent bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-medium px-2 py-0.5 whitespace-nowrap shrink-0">
                      ⭐ RECOMMENDED
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{starterPlan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-bold text-gray-900">${starterPlan.price_monthly}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">{starterPlan.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {(starterPlan.features || PLANS_DATA[0].features).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <Button
                  className={`w-full ${
                    selectedPlan === 'starter'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan('starter');
                  }}
                >
                  {selectedPlan === 'starter' ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    `Select ${starterPlan.name}`
                  )}
                </Button>
              </div>
            </Card>

            {/* Growth Plan */}
            <Card
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedPlan === 'growth'
                  ? 'border-2 border-emerald-500 shadow-lg'
                  : 'border-2 border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div onClick={() => setSelectedPlan('growth')}>
                {/* Recommended Badge */}
                {recommendedPlan === 'growth' && (
                  <div className="flex justify-end mb-2">
                    <span className="inline-flex items-center justify-center rounded-md border-transparent bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-medium px-2 py-0.5 whitespace-nowrap shrink-0">
                      ⭐ RECOMMENDED
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{growthPlan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-bold text-gray-900">${growthPlan.price_monthly}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">{growthPlan.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {(growthPlan.features || PLANS_DATA[1].features).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <Button
                  className={`w-full ${
                    selectedPlan === 'growth'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan('growth');
                  }}
                >
                  {selectedPlan === 'growth' ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    `Select ${growthPlan.name}`
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Savings Calculator */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <DollarSignIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Savings Calculator</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projected Monthly Revenue
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    value={projectedRevenue}
                    onChange={(e) => setProjectedRevenue(e.target.value)}
                    className="pl-8 text-lg font-semibold"
                    placeholder="2,000"
                  />
                </div>
              </div>

              {revenue > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                    <TrendingUpIcon className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-600">Potential Monthly Recovery</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        ${potentialRecovery.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Based on 30% recovery rate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                    <ZapIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Recommended Plan</p>
                      <p className="text-2xl font-bold text-blue-900 capitalize">
                        {recommendedPlan}
                      </p>
                      <p className="text-xs text-gray-500">Optimized for your volume</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-600" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-4 h-4 text-emerald-600" />
              <span>Billed through Shopify</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-600" />
              <span>No long-term contract</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div />
            <Button
              onClick={handleContinue}
              className="bg-emerald-600 hover:bg-emerald-700 px-8"
              size="lg"
              disabled={!selectedPlan || selecting}
            >
              {selecting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
