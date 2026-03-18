'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

type VoiceType = 'friendly' | 'professional' | 'playful' | 'minimal';

const voiceOptions = [
  {
    id: 'friendly' as const,
    icon: '👋',
    name: 'Friendly',
    description: 'Warm & approachable',
    useCase: 'Lifestyle brands, small businesses',
  },
  {
    id: 'professional' as const,
    icon: '💼',
    name: 'Professional',
    description: 'Polished & trustworthy',
    useCase: 'B2B, premium brands',
  },
  {
    id: 'playful' as const,
    icon: '🎉',
    name: 'Playful',
    description: 'Fun & energetic',
    useCase: 'Youth brands, entertainment',
  },
  {
    id: 'minimal' as const,
    icon: '✨',
    name: 'Minimal',
    description: 'Clean & direct',
    useCase: 'Tech brands, modern aesthetics',
  },
];

const emailPreviews: Record<VoiceType, {
  subject: string;
  greeting: string;
  body: string;
  items: string[];
  cta: string;
  closing: string;
  signature: string;
}> = {
  friendly: {
    subject: 'We noticed you left something behind! 🛒',
    greeting: 'Hi Sarah!',
    body: 'We noticed you left some awesome items in your cart. No pressure, but we wanted to make sure you didn\'t forget!',
    items: ['Classic White T-Shirt - $29.00', 'Running Shoes - $89.00'],
    cta: 'Complete Your Order',
    closing: 'Cheers,',
    signature: 'The Team',
  },
  professional: {
    subject: 'Your Cart Awaits Your Return',
    greeting: 'Dear Sarah,',
    body: 'We noticed you have items awaiting purchase in your shopping cart. We wanted to remind you that these items are still available.',
    items: ['Classic White T-Shirt - $29.00', 'Running Shoes - $89.00'],
    cta: 'Complete Your Order',
    closing: 'Best regards,',
    signature: 'Customer Service Team',
  },
  playful: {
    subject: 'Oops! Your cart is feeling lonely! 🎉',
    greeting: 'Hey Sarah! 👋',
    body: 'Your cart is sitting there like "um, hello? remember me?" 😅 Those items are TOTALLY waiting for you!',
    items: ['Classic White T-Shirt - $29.00', 'Running Shoes - $89.00'],
    cta: 'Come Back & Shop!',
    closing: 'You rock! ✨',
    signature: 'The Team',
  },
  minimal: {
    subject: 'Cart Reminder',
    greeting: 'Sarah,',
    body: 'Items in your cart:',
    items: ['Classic White T-Shirt - $29.00', 'Running Shoes - $89.00'],
    cta: 'Complete Order',
    closing: '',
    signature: 'Thanks',
  },
};

// Card component from ui_prototype
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl border ${className || ''}`}
      {...props}
    />
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

// Badge component from ui_prototype
function Badge({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'span'> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground border-border',
  };

  return (
    <span
      data-slot="badge"
      className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className || ''}`}
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

export default function BrandVoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>('friendly');
  const [saving, setSaving] = useState(false);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentStep = 2;
  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const shop = searchParams.get('shop');
    setShopDomain(shop);
  }, [searchParams]);

  useEffect(() => {
    const fetchStoreId = async () => {
      if (!shopDomain) return;

      try {
        const response = await fetch(`/api/store-info?shop=${encodeURIComponent(shopDomain)}`);
        if (response.ok) {
          const data = await response.json();
          setStoreId(data.storeId);
        }
      } catch (err) {
        console.error('Error fetching store ID:', err);
      }
    };

    fetchStoreId();
  }, [shopDomain]);

  const handleContinue = async () => {
    if (!shopDomain) {
      setError('Shop domain not found. Please try again.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/settings?shop=${encodeURIComponent(shopDomain)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_voice: selectedVoice,
          onboarding_step: 'brand_voice',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Settings API error:', response.status, errorData);
        throw new Error(errorData.error || `Failed to save brand voice (${response.status})`);
      }

      const host = searchParams.get('host');
      let redirectUrl = `/onboarding/ai-live?shop=${encodeURIComponent(shopDomain)}`;
      if (host) {
        redirectUrl += `&host=${encodeURIComponent(host)}`;
      }

      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Error saving brand voice:', err);
      setError(err.message || 'Failed to save your selection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const preview = emailPreviews[selectedVoice];

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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Define Your Brand Voice</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose how Yona communicates with your customers</p>
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
          {/* Voice Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {voiceOptions.map((voice) => (
              <Card
                key={voice.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg text-center ${
                  selectedVoice === voice.id
                    ? 'border-2 border-emerald-500 shadow-lg bg-emerald-50'
                    : 'border-2 border-gray-200 hover:border-emerald-300'
                }`}
                onClick={() => setSelectedVoice(voice.id)}
              >
                <div className="text-4xl mb-3">{voice.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{voice.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{voice.description}</p>
                <p className="text-sm text-gray-500 mb-4">{voice.useCase}</p>

                {selectedVoice === voice.id && (
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-semibold">SELECTED</span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Live Email Preview */}
          <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Live Email Preview</h3>
              <Badge variant="outline" className="ml-auto">
                {voiceOptions.find((v) => v.id === selectedVoice)?.name} Voice
              </Badge>
            </div>

            {/* Email Preview Content */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
              {/* Email Header */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <p className="text-xs text-gray-500 mb-1">Subject:</p>
                <p className="font-semibold text-gray-900">{preview.subject}</p>
              </div>

              {/* Email Body */}
              <div className="space-y-4">
                <p className="text-gray-900">{preview.greeting}</p>

                <p className="text-gray-700">{preview.body}</p>

                {preview.body !== 'Items in your cart:' && (
                  <div className="pt-2">
                    <p className="text-gray-900 font-medium mb-2">
                      {selectedVoice === 'playful'
                        ? 'What you left behind:'
                        : 'Your items are waiting for you:'}
                    </p>
                    <ul className="space-y-1">
                      {preview.items.map((item, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {preview.body === 'Items in your cart:' && (
                  <ul className="space-y-1">
                    {preview.items.map((item, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                <div className="pt-4">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                    {preview.cta}
                  </button>
                </div>

                {/* Signature */}
                <div className="pt-4 border-t border-gray-100">
                  {preview.closing && <p className="text-gray-700">{preview.closing}</p>}
                  <p className="text-gray-900 font-medium">{preview.signature}</p>
                </div>
              </div>
            </div>

            {/* Preview Note */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              This is a preview of how your cart abandonment emails will look. All content is AI-personalized for each customer.
            </p>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-emerald-600 hover:bg-emerald-700 px-8"
              size="lg"
              disabled={!storeId || saving}
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
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
