'use client';

import { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  Brain,
  Clock,
  Target,
  Send,
  Ban,
  ShoppingCart,
  CreditCard,
  Eye,
  Package,
  RefreshCw,
  Mail,
  UserX,
  DollarSign,
  Zap,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import logger from '@/utils/logger';

interface ActivityFeedProps {
  aiStatus: "active" | "paused";
  storeId?: string;
}

interface Activity {
  id: string;
  type: "decision" | "conversion" | "learning";
  action: string;
  reasoning: string;
  time: string;
  revenue?: number;
  customer?: string;
  campaign?: string;
}

interface ActivityWithDetails extends Activity {
  campaign?: string;
}

function getActivityIcon(activity: ActivityWithDetails) {
  const { type, action, campaign, revenue } = activity;

  // Revenue/Conversion activities
  if (revenue && revenue > 0) {
    return <DollarSign className="w-4 h-4" />;
  }

  // Decision activities based on action and campaign type
  if (type === "decision") {
    // Skip decisions
    if (action?.toLowerCase().includes("skip")) {
      return <UserX className="w-4 h-4" />;
    }

    // Send decisions - use campaign-specific icons
    if (campaign) {
      const campaignLower = campaign.toLowerCase();
      if (campaignLower.includes("cart")) {
        return <ShoppingCart className="w-4 h-4" />;
      }
      if (campaignLower.includes("checkout")) {
        return <CreditCard className="w-4 h-4" />;
      }
      if (campaignLower.includes("browse")) {
        return <Eye className="w-4 h-4" />;
      }
      if (campaignLower.includes("post_purchase")) {
        return <Package className="w-4 h-4" />;
      }
      if (campaignLower.includes("repeat")) {
        return <RefreshCw className="w-4 h-4" />;
      }
    }

    // Default for send decisions
    if (action?.toLowerCase().includes("sent")) {
      return <Send className="w-4 h-4" />;
    }

    return <Target className="w-4 h-4" />;
  }

  // Conversion activities
  if (type === "conversion") {
    return <TrendingUp className="w-4 h-4" />;
  }

  // Learning activities
  if (type === "learning") {
    return <Lightbulb className="w-4 h-4" />;
  }

  return <Zap className="w-4 h-4" />;
}

function getActivityColor(activity: ActivityWithDetails) {
  const { type, action, campaign, revenue } = activity;

  // Revenue/Conversion - Green
  if (revenue && revenue > 0) {
    return "bg-green-100 text-green-700";
  }

  // Decision activities
  if (type === "decision") {
    // Skip decisions - Gray/Orange
    if (action?.toLowerCase().includes("skip")) {
      return "bg-orange-100 text-orange-700";
    }

    // Campaign-specific colors
    if (campaign) {
      const campaignLower = campaign.toLowerCase();
      if (campaignLower.includes("cart")) {
        return "bg-blue-100 text-blue-700";
      }
      if (campaignLower.includes("checkout")) {
        return "bg-indigo-100 text-indigo-700";
      }
      if (campaignLower.includes("browse")) {
        return "bg-cyan-100 text-cyan-700";
      }
      if (campaignLower.includes("post_purchase")) {
        return "bg-purple-100 text-purple-700";
      }
      if (campaignLower.includes("repeat")) {
        return "bg-pink-100 text-pink-700";
      }
    }

    return "bg-blue-100 text-blue-700";
  }

  // Conversion - Green
  if (type === "conversion") {
    return "bg-emerald-100 text-emerald-700";
  }

  // Learning - Purple
  if (type === "learning") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-gray-100 text-gray-700";
}

export function ActivityFeed({ aiStatus, storeId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      if (!storeId || aiStatus === "paused") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/activity?storeId=${storeId}&limit=50&days=7`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }

        const data = await response.json();
        setActivities(data.activities || []);

        logger.info('Activity feed fetched successfully', {
          context: 'ActivityFeed',
          metadata: { storeId, count: data.activities?.length || 0 }
        });
      } catch (err: any) {
        logger.error('Error fetching activity feed', {
          context: 'ActivityFeed',
          error: err,
          metadata: { storeId }
        });
        setError(err.message);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();

    // Poll for new activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [storeId, aiStatus]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Decision Log</h3>
          <p className="text-sm text-gray-500 mt-1">Every action explained in plain language</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live
        </Badge>
      </div>

      {aiStatus === "paused" ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">AI Agent Paused</h4>
          <p className="text-sm text-gray-500">Resume to see autonomous revenue recovery in action</p>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h4>
          <p className="text-sm text-gray-500">AI is monitoring your store. Activity will appear here when customers engage.</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={`${activity.id}-${index}`} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg h-fit ${getActivityColor(activity)}`}>
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{activity.action}</h4>
                        {activity.campaign && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {activity.campaign}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mt-1">
                      <span className="font-medium">Why:</span> {activity.reasoning}
                    </p>
                    {activity.revenue && activity.revenue > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs font-semibold text-green-700">
                        <TrendingUp className="w-3 h-3" />
                        +${activity.revenue.toFixed(2)} recovered
                      </div>
                    )}
                    {activity.customer && !activity.revenue && (
                      <div className="mt-2 text-xs text-gray-500">
                        Customer: {activity.customer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
