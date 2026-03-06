'use client';

import React from 'react';

interface OnboardingHeaderProps {
  title: string;
  subtitle?: string;
}

export default function OnboardingHeader({ title, subtitle }: OnboardingHeaderProps) {
  return (
    <div className="yona-onboarding-header">
      <h1 className="yona-onboarding-title">{title}</h1>
      {subtitle && <p className="yona-onboarding-subtitle">{subtitle}</p>}
    </div>
  );
}
