'use client';

import { Card } from './ui/card';
import { TimeRange } from './MetricsGrid';

interface InsightsPanelProps {
  timeRange: TimeRange;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'learning';
  icon: React.ReactNode;
  title: string;
  description: string;
}

function getInsights(timeRange: TimeRange): Insight[] {
  const baseInsights: Insight[] = [
    {
      id: '1',
      type: 'learning',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI Learning Active',
      description: "Agent is continuously improving send timing based on your customers' behavior patterns. Current optimization: Friday 6-9PM window.",
    },
    {
      id: '2',
      type: 'success',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Personalization Working',
      description: 'Emails with customer names show 67% higher open rates. AI has applied this to all campaigns automatically.',
    },
    {
      id: '3',
      type: 'info',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Optimal Timing Detected',
      description: 'Cart abandonment emails sent within 2 hours show 2.3x higher conversion than 24hr delays. AI adjusted timing.',
    },
  ];

  if (timeRange === '30days') {
    return [
      {
        id: '4',
        type: 'success',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'Strong Monthly Performance',
        description: 'Revenue recovery increased 35% this month. AI autonomy is delivering consistent results without manual intervention.',
      },
      ...baseInsights,
    ];
  }

  if (timeRange === 'today') {
    return [
      {
        id: '5',
        type: 'warning',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        title: 'Low Activity Today',
        description: 'No conversions yet today. AI is monitoring and will engage high-intent shoppers as they appear.',
      },
      ...baseInsights.slice(1),
    ];
  }

  return baseInsights;
}

function getInsightColor(type: Insight['type']) {
  switch (type) {
    case 'success':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'info':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'learning':
      return 'bg-purple-50 text-purple-700 border-purple-200';
  }
}

export function InsightsPanel({ timeRange }: InsightsPanelProps) {
  const insights = getInsights(timeRange);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{insight.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

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
