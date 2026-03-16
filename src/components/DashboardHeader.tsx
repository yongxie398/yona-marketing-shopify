'use client';

import { Grid3x3, MoreVertical, Settings, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  shopDomain?: string | null;
}

export function DashboardHeader({ shopDomain }: DashboardHeaderProps) {
  const handleNavigateToDashboard = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('shop') || '';
    const host = urlParams.get('host') || '';
    window.location.href = `/?shop=${encodeURIComponent(domain)}&host=${encodeURIComponent(host)}`;
  };

  const handleNavigateToBilling = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('shop') || '';
    const host = urlParams.get('host') || '';
    window.location.href = `/billing?shop=${encodeURIComponent(domain)}&host=${encodeURIComponent(host)}`;
  };

  const handleNavigateToSettings = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('shop') || '';
    const host = urlParams.get('host') || '';
    window.location.href = `/settings?shop=${encodeURIComponent(domain)}&host=${encodeURIComponent(host)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <button 
            onClick={handleNavigateToDashboard}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
              <Grid3x3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Yona</span>
          </button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleNavigateToSettings}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleNavigateToBilling}
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
