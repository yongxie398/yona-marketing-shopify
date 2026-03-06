'use client';

import React from 'react';

interface YonaButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}

export default function YonaButton({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button'
}: YonaButtonProps) {
  const getBackgroundColor = () => {
    if (disabled || loading) return 'var(--bg-hover)';
    switch (variant) {
      case 'primary':
        return 'var(--primary-500)';
      case 'secondary':
        return 'var(--bg-card)';
      case 'ghost':
        return 'transparent';
      default:
        return 'var(--primary-500)';
    }
  };

  const getColor = () => {
    if (disabled || loading) return 'var(--text-muted)';
    switch (variant) {
      case 'primary':
        return 'var(--text-inverse)';
      case 'secondary':
      case 'ghost':
        return 'var(--text-primary)';
      default:
        return 'var(--text-inverse)';
    }
  };

  const getBorder = () => {
    if (disabled || loading) return '1px solid var(--border-default)';
    switch (variant) {
      case 'primary':
        return 'none';
      case 'secondary':
        return '1px solid var(--border-default)';
      case 'ghost':
        return 'none';
      default:
        return 'none';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return '6px 12px';
      case 'large':
        return '12px 24px';
      case 'medium':
      default:
        return '10px 16px';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 'var(--text-sm)';
      case 'large':
        return 'var(--text-base)';
      case 'medium':
      default:
        return 'var(--text-base)';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: getBackgroundColor(),
        color: getColor(),
        border: getBorder(),
        borderRadius: 'var(--radius-md)',
        padding: getPadding(),
        fontSize: getFontSize(),
        fontWeight: 'var(--font-medium)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        transition: 'all var(--transition-fast)',
        opacity: disabled || loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = 'var(--primary-600)';
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          } else if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = getBackgroundColor();
      }}
    >
      {loading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'yona-spin 1s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
}
