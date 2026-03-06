'use client';

import React from 'react';

interface YonaCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  variant?: 'default' | 'highlighted' | 'selected';
  onClick?: () => void;
}

export default function YonaCard({ 
  children, 
  className = '',
  padding = 'medium',
  variant = 'default',
  onClick
}: YonaCardProps) {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'small':
        return 'var(--space-4)';
      case 'large':
        return 'var(--space-6)';
      case 'medium':
      default:
        return 'var(--space-5)';
    }
  };

  const getBorderStyle = () => {
    switch (variant) {
      case 'highlighted':
        return '2px solid var(--primary-500)';
      case 'selected':
        return '2px solid var(--primary-500)';
      case 'default':
      default:
        return '1px solid var(--border-default)';
    }
  };

  const getBackground = () => {
    switch (variant) {
      case 'selected':
        return 'var(--primary-50)';
      case 'highlighted':
      case 'default':
      default:
        return 'var(--bg-card)';
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: getBackground(),
        borderRadius: 'var(--radius-lg)',
        border: getBorderStyle(),
        boxShadow: variant === 'selected' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        padding: getPadding(),
        transition: 'all var(--transition-normal)',
        cursor: onClick ? 'pointer' : 'default',
        transform: variant === 'selected' ? 'translateY(-2px)' : 'translateY(0)',
      }}
      className={className}
      onMouseEnter={(e) => {
        if (onClick && variant !== 'selected') {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--primary-300)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && variant !== 'selected') {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-default)';
        }
      }}
    >
      {children}
    </div>
  );
}
