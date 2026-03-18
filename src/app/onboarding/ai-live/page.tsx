'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Circle, Zap, TrendingUp, Mail, BarChart3, Clock } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

interface SetupStatus {
  dataSynced: boolean;
  brandVoiceSet: boolean;
  aiActivated: boolean;
}

// Card component from ui_prototype
function Card({ className, children, ...props }: React.ComponentProps<'div'>) {
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

// Progress component from ui_prototype
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<'div'> & {
  value: number;
}) {
  return (
    <div
      data-slot="progress"
      className={`bg-gray-200 relative h-2 w-full overflow-hidden rounded-full ${className || ''}`}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="bg-gray-900 h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}

export default function AILiveConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    dataSynced: false,
    brandVoiceSet: false,
    aiActivated: false
  });

  const currentStep = 3;
  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const shop = searchParams.get('shop');
    setShopDomain(shop);
  }, [searchParams]);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      if (!shopDomain) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        
        if (response.ok) {
          const data = await response.json();
          setStoreId(data.storeId);
          
          // Check setup status
          setSetupStatus({
            dataSynced: true,
            brandVoiceSet: true,
            aiActivated: data.aiEnabled || false
          });
        } else {
          setError('Failed to load store information');
        }
      } catch (err) {
        console.error('Error fetching store info:', err);
        setError('Failed to load store information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStoreInfo();
  }, [shopDomain]);

  const handleActivateAI = async () => {
    if (!storeId) {
      setError('Store not found');
      return;
    }

    setActivating(true);
    setError(null);

    try {
      const response = await fetch(`/api/settings?shop=${encodeURIComponent(shopDomain || '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: storeId,
          paused: false,
          ai_enabled: true,
          onboarding_step: 'ai_live',
          onboarding_complete: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to activate AI');
      }

      setSetupStatus(prev => ({ ...prev, aiActivated: true }));
      
      setTimeout(() => {
        const host = searchParams.get('host');
        let redirectUrl = `/?shop=${encodeURIComponent(shopDomain || '')}`;
        if (host) {
          redirectUrl += `&host=${encodeURIComponent(host)}`;
        }
        router.push(redirectUrl);
      }, 2000);
    } catch (err) {
      console.error('Error activating AI:', err);
      setError('Failed to activate AI. Please try again.');
    } finally {
      setActivating(false);
    }
  };

  const handleBack = () => {
    router.push(`/onboarding/brand-voice?shop=${encodeURIComponent(shopDomain || '')}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const allComplete = setupStatus.dataSynced && setupStatus.brandVoiceSet && setupStatus.aiActivated;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Yona AI Revenue Agent</h3>
                <p className="text-xs text-gray-500">Quick Setup</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">
                Step {currentStep} of {totalSteps}
              </span>
              <p className="text-xs text-gray-500">{Math.round(progressPercentage)}% Complete</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {allComplete ? 'Your AI is Ready! 🎉' : 'Ready to Activate?'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {allComplete 
              ? 'Your AI Revenue Agent is now monitoring your store'
              : 'Review your setup and activate your revenue agent'
            }
          </p>
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

        {/* Success Banner */}
        {allComplete && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-emerald-800">
              <strong>Success!</strong> Your AI Revenue Agent is now active and monitoring your store.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Setup Status */}
          <Card className="p-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Setup Status</h3>
            </div>

            <div className="space-y-4">
              {/* Data Synced */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Data Synced</h4>
                  <p className="text-sm text-gray-600">Your store data has been imported and analyzed</p>
                </div>
              </div>

              {/* Brand Voice Set */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Brand Voice Set</h4>
                  <p className="text-sm text-gray-600 capitalize">Your AI&apos;s personality is configured</p>
                </div>
              </div>

              {/* AI Activation Pending */}
              <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                setupStatus.aiActivated 
                  ? 'bg-white border-emerald-200' 
                  : 'bg-blue-50 border-blue-300'
              }`}>
                {setupStatus.aiActivated ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center mt-0.5">
                    <Circle className="w-3 h-3 fill-blue-600 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    setupStatus.aiActivated ? 'text-gray-900' : 'text-blue-900'
                  }`}>
                    {setupStatus.aiActivated ? 'AI Activated' : 'AI Activation Pending'}
                  </h4>
                  <p className={`text-sm ${
                    setupStatus.aiActivated ? 'text-gray-600' : 'text-blue-700'
                  }`}>
                    {setupStatus.aiActivated 
                      ? 'Your AI is monitoring and sending messages'
                      : 'Click "Activate AI" below to start monitoring'
                    }
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* What Happens Next */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">What Happens Next</h3>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-700" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">1. AI Starts Monitoring</h4>
                  <p className="text-sm text-gray-600">
                    Yona begins tracking abandoned carts, checkouts, and customer behavior patterns in real-time
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-700" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">2. Automatic Personalized Messages</h4>
                  <p className="text-sm text-gray-600">
                    AI-generated emails sent at optimal times based on customer behavior and engagement patterns
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-700" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">3. Revenue Recovery</h4>
                  <p className="text-sm text-gray-600">
                    Recovered sales automatically appear in your dashboard with full attribution tracking
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-amber-700" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">4. Continuous Optimization</h4>
                  <p className="text-sm text-gray-600">
                    AI runs A/B tests and learns from results to improve performance automatically
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Expected Timeline */}
          <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Expected first action: Within 24 hours</p>
              <p className="text-xs text-blue-700">First recovered sale typically within 3-7 days</p>
            </div>
          </div>

          {/* Set it and Forget it Message */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Set It and Forget It</h3>
              <p className="text-gray-700 max-w-md mx-auto">
                Your AI Revenue Agent works autonomously 24/7. No manual intervention needed. 
                Just monitor results and watch your revenue grow.
              </p>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={handleBack} disabled={activating || allComplete}>
              Back
            </Button>
            
            {allComplete ? (
              <Button
                onClick={() => router.push(`/?shop=${encodeURIComponent(shopDomain || '')}`)}
                className="bg-emerald-600 hover:bg-emerald-700 px-8"
                size="lg"
              >
                Go to Dashboard →
              </Button>
            ) : (
              <Button
                onClick={handleActivateAI}
                disabled={!storeId || activating}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8"
                size="lg"
              >
                {activating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Activate AI
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
