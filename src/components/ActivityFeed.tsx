'use client';

import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, Brain, Clock, Target } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface ActivityFeedProps {
  aiStatus: "active" | "paused";
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

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "conversion",
    action: "Revenue recovered",
    reasoning: "Sarah M. completed purchase after cart abandonment email",
    time: "8 minutes ago",
    revenue: 127.50,
    customer: "Sarah M.",
    campaign: "Cart Abandonment"
  },
  {
    id: "2",
    type: "decision",
    action: "Sent cart abandonment email",
    reasoning: "Michael added $215 to cart, viewed 3x in 2 days, no frequency cap hit",
    time: "15 minutes ago",
    customer: "Michael C.",
    campaign: "Cart Abandonment"
  },
  {
    id: "3",
    type: "learning",
    action: "AI optimized send timing",
    reasoning: "Friday 6-9PM shows 3.2x higher conversion → adjusted timing window",
    time: "32 minutes ago",
  },
  {
    id: "4",
    type: "decision",
    action: "Sent browse abandonment email",
    reasoning: "Emma viewed product 4x, high-intent behavior detected, 4hr delay optimal",
    time: "1 hour ago",
    customer: "Emma W.",
    campaign: "Browse Abandonment"
  },
  {
    id: "5",
    type: "conversion",
    action: "Revenue recovered",
    reasoning: "James T. completed checkout after abandonment intervention",
    time: "2 hours ago",
    revenue: 89.99,
    customer: "James T.",
    campaign: "Checkout Abandonment"
  },
  {
    id: "6",
    type: "decision",
    action: "Paused messaging to customer",
    reasoning: "Lisa hit frequency cap (3 messages in 7 days) → waiting 48h",
    time: "3 hours ago",
    customer: "Lisa P.",
  },
  {
    id: "7",
    type: "learning",
    action: "AI improved subject lines",
    reasoning: "Personalized subjects show +67% open rate → now default",
    time: "4 hours ago",
  },
  {
    id: "8",
    type: "decision",
    action: "Sent post-purchase follow-up",
    reasoning: "David completed order → building trust with immediate thank you",
    time: "5 hours ago",
    customer: "David K.",
    campaign: "Post-Purchase"
  },
];

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "decision":
      return <Target className="w-4 h-4" />;
    case "conversion":
      return <TrendingUp className="w-4 h-4" />;
    case "learning":
      return <Brain className="w-4 h-4" />;
  }
}

function getActivityColor(type: Activity["type"]) {
  switch (type) {
    case "decision":
      return "bg-blue-100 text-blue-700";
    case "conversion":
      return "bg-green-100 text-green-700";
    case "learning":
      return "bg-purple-100 text-purple-700";
  }
}

export function ActivityFeed({ aiStatus }: ActivityFeedProps) {
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
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg h-fit ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
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
                    {activity.revenue && (
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
