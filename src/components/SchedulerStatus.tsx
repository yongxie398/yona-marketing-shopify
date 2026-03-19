'use client';

import { useSchedulerStatus } from '@/hooks/useDashboardData';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RefreshCw } from "lucide-react";

interface SchedulerStatusProps {
  storeId?: string;
}

interface SchedulerState {
  running: boolean;
  interval_seconds: number;
  delay_config: {
    [key: string]: {
      days: number;
      hours: number;
      minutes: number;
    };
  };
}

export function SchedulerStatus({ storeId }: SchedulerStatusProps) {
  const { status, isLoading } = useSchedulerStatus();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status?.running ? 'bg-green-100' : 'bg-amber-100'}`}>
            {status?.running ? (
              <RefreshCw className="w-5 h-5 text-green-600 animate-spin" style={{ animationDuration: '3s' }} />
            ) : (
              <Pause className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">Campaign Scheduler</h4>
              <Badge variant={status?.running ? 'default' : 'secondary'} className="text-xs">
                {status?.running ? 'Running' : 'Paused'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Checks every {status?.interval_seconds || 60} seconds
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
