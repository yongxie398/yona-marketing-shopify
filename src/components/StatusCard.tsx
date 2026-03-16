'use client';

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Zap, Clock } from "lucide-react";

interface StatusCardProps {
  aiStatus: "active" | "paused";
}

export function StatusCard({ aiStatus }: StatusCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">AI Revenue Agent</h2>
              <Badge 
                variant={aiStatus === "active" ? "default" : "secondary"}
                className="gap-1"
              >
                <span className={`w-2 h-2 rounded-full ${aiStatus === "active" ? "bg-green-200 animate-pulse" : "bg-gray-400"}`} />
                {aiStatus === "active" ? "Working" : "Paused"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {aiStatus === "active" 
                ? "Autonomously recovering revenue from abandoned shoppers" 
                : "Revenue recovery paused"}
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
          <div className="text-3xl font-bold text-gray-900 mb-1">$0</div>
          <p className="text-xs text-gray-500">Today</p>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Interventions</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
          <p className="text-xs text-gray-500">
            {aiStatus === "active" ? "Monitoring shoppers" : "Paused"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-purple-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Time to First Sale</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">--</div>
          <p className="text-xs text-gray-500">After install</p>
        </div>
      </div>
    </Card>
  );
}
