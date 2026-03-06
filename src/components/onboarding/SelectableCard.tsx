'use client';

import React from 'react';

interface SelectableCardProps {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export default function SelectableCard({ 
  children, 
  isSelected, 
  onClick, 
  className = '' 
}: SelectableCardProps) {
  return (
    <div
      className={`yona-onboarding-card ${isSelected ? 'yona-onboarding-card--selected' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface SelectableCardTitleProps {
  children: React.ReactNode;
  icon?: string;
  isSelected?: boolean;
}

export function SelectableCardTitle({ children, icon, isSelected }: SelectableCardTitleProps) {
  return (
    <div className="yona-onboarding-card__title">
      {icon && <span style={{ fontSize: '20px' }}>{icon}</span>}
      {children}
      {isSelected && (
        <span className="yona-onboarding-card__check">✓</span>
      )}
    </div>
  );
}

interface SelectableCardDescriptionProps {
  children: React.ReactNode;
}

export function SelectableCardDescription({ children }: SelectableCardDescriptionProps) {
  return <p className="yona-onboarding-card__description">{children}</p>;
}

interface SelectableCardMetaProps {
  children: React.ReactNode;
}

export function SelectableCardMeta({ children }: SelectableCardMetaProps) {
  return <p className="yona-onboarding-card__meta">{children}</p>;
}
