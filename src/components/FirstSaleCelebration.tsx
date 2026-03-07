'use client';

import { useState, useEffect } from 'react';
import { Trophy, DollarSign, User, Clock, X, ArrowRight } from 'lucide-react';

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
  recoveryTime = "15 minutes",
  campaign = "Cart Abandonment"
}: FirstSaleCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      // Animate the amount counting up
      const duration = 800;
      const steps = 30;
      const increment = saleAmount / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= saleAmount) {
          setDisplayAmount(saleAmount);
          clearInterval(timer);
        } else {
          setDisplayAmount(current);
        }
      }, duration / steps);

      // Auto-hide confetti
      const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
      
      return () => {
        clearInterval(timer);
        clearTimeout(confettiTimer);
      };
    }
  }, [open, saleAmount]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        {/* Modal - Fixed size, no scroll */}
        <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
          {/* Confetti Background */}
          {showConfetti && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
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
                    className="h-2.5 w-2.5 rounded-full"
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

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>

          {/* Content - Compact, no scroll */}
          <div className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 text-center">
            {/* Trophy Icon */}
            <div className="mb-3 inline-flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
              <Trophy className="h-7 w-7 text-white" />
            </div>

            {/* Title */}
            <h2 className="mb-1 text-xl font-bold text-gray-900">
              🎉 First Sale Recovered!
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Your AI agent just recovered its first sale.
            </p>

            {/* Amount - Big & Bold */}
            <div className="mb-4">
              <div className="flex items-center justify-center gap-1">
                <DollarSign className="h-6 w-6 text-emerald-600" />
                <span className="text-5xl font-bold text-emerald-900">
                  {displayAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs font-medium text-emerald-700 mt-1">Recovered Revenue</p>
            </div>

            {/* Key Details - Horizontal Layout */}
            <div className="mb-5 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-gray-900">{customerName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-gray-900">{recoveryTime}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 flex items-center justify-center gap-1.5"
              >
                View in Decision Log
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Continue
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
