'use client';

import React from 'react';
import YonaButton from '../YonaButton';

interface OnboardingActionsProps {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  backLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  hint?: string;
}

export default function OnboardingActions({
  onBack,
  onContinue,
  continueLabel = 'Continue',
  backLabel = '← Back',
  isLoading = false,
  isDisabled = false,
  hint
}: OnboardingActionsProps) {
  return (
    <div className="yona-onboarding-actions">
      <div className="yona-onboarding-actions__row">
        {onBack ? (
          <YonaButton variant="ghost" onClick={onBack}>
            {backLabel}
          </YonaButton>
        ) : (
          <div />
        )}
        <YonaButton
          variant="primary"
          onClick={onContinue}
          loading={isLoading}
          disabled={isDisabled || isLoading}
        >
          {continueLabel}
        </YonaButton>
      </div>
      {hint && <p className="yona-onboarding-actions__hint">{hint}</p>}
    </div>
  );
}
