'use client';

import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className="yona-onboarding-progress">
      <div className="yona-onboarding-progress__header">
        <span className="yona-onboarding-progress__label">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="yona-onboarding-progress__percent">
          {percentage}% complete
        </span>
      </div>
      <div className="yona-onboarding-progress__bar">
        <div 
          className="yona-onboarding-progress__fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
