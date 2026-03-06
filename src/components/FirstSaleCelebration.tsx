'use client';

import { useState, useEffect } from 'react';
import { Trophy, DollarSign, User, Clock, Share2, X, Target } from 'lucide-react';

interface FirstSaleData {
  order_id: string;
  customer_email: string;
  customer_name?: string;
  revenue: number;
  recovery_time_hours: number;
  message_preview: string;
  campaign_type: string;
}

interface FirstSaleCelebrationProps {
  open: boolean;
  onClose: () => void;
  saleAmount?: number;
  customerName?: string;
  recoveryTime?: string;
  campaign?: string;
}

export default function FirstSaleCelebration({ 
  open, 
  onClose, 
  saleAmount = 127.50,
  customerName = "Sarah Johnson",
  recoveryTime = "2 hours 34 minutes",
  campaign = "Cart Abandonment"
}: FirstSaleCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleShare = () => {
    const shareText = `Just recovered my first sale with Yona AI! 💰 $${saleAmount.toFixed(2)} in revenue automatically recovered. 🎉`;
    
    if (navigator.share) {
      navigator.share({
        title: "Yona AI First Win!",
        text: shareText,
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        alert("Copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Copied to clipboard!");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
          {showConfetti && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: [
                        "#10b981",
                        "#3b82f6",
                        "#f59e0b",
                        "#ec4899",
                        "#8b5cf6",
                      ][Math.floor(Math.random() * 5)],
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-8">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                🎉 CONGRATULATIONS! 🎉
              </h2>
              <p className="text-lg font-semibold text-gray-700">
                🏆 First Win Achievement Unlocked!
              </p>
              <p className="mt-2 text-gray-600">
                You just recovered your first sale!
              </p>
            </div>

            <div className="mb-6 rounded-xl border-2 border-emerald-200 bg-white p-6 shadow-xl">
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                    <span className="text-5xl font-bold text-emerald-900">
                      ${saleAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">Recovered Revenue</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Customer</p>
                      <p className="font-semibold text-gray-900">{customerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-600">Recovery Time</p>
                      <p className="font-semibold text-gray-900">{recoveryTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="flex h-5 w-5 items-center justify-center">
                      <Target className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Campaign</p>
                      <p className="font-semibold text-gray-900">{campaign}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 text-center">
              <p className="text-sm text-gray-700">
                This is just the beginning! Your AI Revenue Agent is working 24/7 
                to recover more sales automatically.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex-1 gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <Share2 className="h-4 w-4" />
                Share Your Win
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </>
  );
}
