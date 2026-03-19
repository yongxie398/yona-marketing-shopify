'use client';

import { useActivityFeed } from '@/hooks/useDashboardData';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
    // Send decisions
    if (action?.toLowerCase().includes("send")) {
      return <Send className="w-4 h-4" />;
    }
    // Wait decisions
    if (action?.toLowerCase().includes("wait")) {
      return <Clock className="w-4 h-4" />;
    }
  }

  // Campaign-specific icons
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
    if (campaignLower.includes("post_purchase") || campaignLower.includes("repeat")) {
      return <Package className="w-4 h-4" />;
    }
  }

  // Learning activities
  if (type === "learning") {
    return <Brain className="w-4 h-4" />;
  }

  // Conversion activities
  if (type === "conversion") {
    return <TrendingUp className="w-4 h-4" />;
  }

  // Default icons based on type
  switch (type) {
    case "decision":
      return <Zap className="w-4 h-4" />;
    case "conversion":
      return <Target className="w-4 h-4" />;
    case "learning":
      return <Lightbulb className="w-4 h-4" />;
    default:
      return <BarChart3 className="w-4 h-4" />;
  }
}

function getActivityColor(activity: ActivityWithDetails) {
  const { type, action, revenue } = activity;

  // Revenue-generating activities
  if (revenue && revenue > 0) {
    return "bg-green-100 text-green-700";
  }

  // Decision activities
  if (type === "decision") {
    if (action?.toLowerCase().includes("skip")) {
      return "bg-gray-100 text-gray-600";
    }
    if (action?.toLowerCase().includes("send")) {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-amber-100 text-amber-700";
  }

  // Learning activities
  if (type === "learning") {
    return "bg-purple-100 text-purple-700";
  }

  // Conversion activities
  if (type === "conversion") {
    return "bg-green-100 text-green-700";
  }

  return "bg-gray-100 text-gray-700";
}

export function ActivityFeed({ aiStatus, storeId }: ActivityFeedProps) {
  const { activities, isLoading, isError } = useActivityFeed(storeId);

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
      ) : isLoading ? (
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
      ) : isError ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8 text-red-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Activity</h4>
          <p className="text-sm text-gray-500">Please refresh the page to try again</p>
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
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity: ActivityWithDetails) => (
              <div
                key={activity.id}
                className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity)}`}>
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activity.reasoning}
                        </p>
                        {activity.revenue && activity.revenue > 0 && (
                          <p className="text-xs font-medium text-green-600 mt-1">
                            +${activity.revenue.toFixed(2)} revenue
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
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
