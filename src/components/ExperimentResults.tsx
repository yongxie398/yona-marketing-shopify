'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Target, 
  AlertCircle, 
  CheckCircle2,
  BarChart3, 
  Calendar, 
  Pause, 
  Play,
  StopCircle 
} from 'lucide-react';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  targetEvent: string;
  trafficAllocation: number;
  startDate: string;
  endDate?: string;
  primaryMetric: 'revenue' | 'conversion_rate' | 'aov';
  control: {
    users: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    revenuePerUser: number;
  };
  treatment: {
    users: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    revenuePerUser: number;
  };
  statistics: {
    lift: number;
    pValue: number;
    confidenceLevel: number;
    isSignificant: boolean;
  };
  daysRunning: number;
}

interface ExperimentResultsProps {
  experiment: Experiment;
  onBack: () => void;
}

// Utility function for class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
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

// Progress Component
function Progress({ className, value }: { className?: string; value: number }) {
  return (
    <div className={cn('bg-gray-200 relative h-2 w-full overflow-hidden rounded-full', className)}>
      <div
        className="bg-gray-900 h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}

export function ExperimentResults({ experiment, onBack }: ExperimentResultsProps) {
  const revenueDiff = experiment.treatment.revenue - experiment.control.revenue;
  const isPositiveLift = experiment.statistics.lift > 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-600">Running</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-600">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600">Completed</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{experiment.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{experiment.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(experiment.status)}
          {experiment.status === 'running' && (
            <>
              <Button variant="outline" size="sm" className="gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
              <Button variant="destructive" size="sm" className="gap-2">
                <StopCircle className="w-4 h-4" />
                Stop
              </Button>
            </>
          )}
          {experiment.status === 'paused' && (
            <Button size="sm" className="gap-2">
              <Play className="w-4 h-4" />
              Resume
            </Button>
          )}
        </div>
      </div>

      {/* Key Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cn(
          'p-5 border-2',
          experiment.statistics.isSignificant
            ? isPositiveLift ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
            : 'border-gray-300'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {isPositiveLift ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm font-medium text-gray-700">Lift</span>
          </div>
          <div className={cn(
            'text-4xl font-bold',
            experiment.statistics.isSignificant
              ? isPositiveLift ? 'text-green-900' : 'text-red-900'
              : 'text-gray-700'
          )}>
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
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
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
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
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
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
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
            <Badge className="bg-blue-600">AI Enhanced</Badge>
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

      {/* Statistical Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistical Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Methodology</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Test Type:</span>
                <span className="font-medium text-gray-900">Two-sample t-test</span>
              </div>
              <div className="flex justify-between">
                <span>Significance Level:</span>
                <span className="font-medium text-gray-900">α = 0.05</span>
              </div>
              <div className="flex justify-between">
                <span>Traffic Split:</span>
                <span className="font-medium text-gray-900">{experiment.trafficAllocation}/{100 - experiment.trafficAllocation}</span>
              </div>
              <div className="flex justify-between">
                <span>Bucketing:</span>
                <span className="font-medium text-gray-900">Hash-based deterministic</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Results</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>P-value:</span>
                <span className="font-medium text-gray-900">{experiment.statistics.pValue.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Level:</span>
                <span className="font-medium text-gray-900">{experiment.statistics.confidenceLevel.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Effect Size:</span>
                <span className="font-medium text-gray-900">{experiment.statistics.lift.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Conclusion:</span>
                <span className={cn(
                  'font-medium',
                  experiment.statistics.isSignificant ? 'text-green-700' : 'text-amber-700'
                )}>
                  {experiment.statistics.isSignificant ? 'Significant' : 'Inconclusive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
