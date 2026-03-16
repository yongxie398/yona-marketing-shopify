'use client';

import { useState, useEffect } from 'react';
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Play, Pause, Clock, RefreshCw, Settings } from "lucide-react";
import logger from '@/utils/logger';

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
  const [status, setStatus] = useState<SchedulerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        setLoading(true);

        const response = await fetch('/api/scheduler/status', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch scheduler status: ${response.status}`);
        }

        const data = await response.json();
        setStatus(data);

        logger.info('Scheduler status fetched', {
          context: 'SchedulerStatus',
          metadata: { running: data.running }
        });
      } catch (err: any) {
        logger.error('Error fetching scheduler status', {
          context: 'SchedulerStatus',
          error: err
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();

    // Poll for status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = async () => {
    try {
      setTriggering(true);

      const response = await fetch('/api/scheduler/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger scheduler: ${response.status}`);
      }

      const data = await response.json();
      
      logger.info('Scheduler triggered', {
        context: 'SchedulerStatus',
        metadata: data
      });

      // Refresh status after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      logger.error('Error triggering scheduler', {
        context: 'SchedulerStatus',
        error: err
      });
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleTrigger}
            disabled={triggering}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {triggering ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Now
          </button>
        </div>
      </div>

      {status?.delay_config && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-600">Campaign Delays</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(status.delay_config).map(([campaign, config]) => (
              <div key={campaign} className="flex items-center justify-between text-xs">
                <span className="text-gray-500 capitalize">{campaign.replace('_', ' ')}</span>
                <span className="text-gray-700 font-medium">
                  {config.hours > 0 && `${config.hours}h `}
                  {config.minutes > 0 && `${config.minutes}m`}
                  {config.hours === 0 && config.minutes === 0 && 'Immediate'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
