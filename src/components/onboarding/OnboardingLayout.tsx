'use client';

import React from 'react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function OnboardingLayout({ children, className = '' }: OnboardingLayoutProps) {
  return (
    <div className={`yona-onboarding-container ${className}`}>
      {children}
    </div>
  );
}
