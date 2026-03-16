/**
 * Number formatting utilities for dashboard metrics
 * Follows industry best practices for SaaS dashboards
 */

/**
 * Format large numbers with k/M/B suffixes
 * Examples: 52857 -> 52.9k, 1500000 -> 1.5M
 */
export function formatCompactNumber(value: number): string {
  if (value === 0) return '0';
  if (value < 1000) return value.toString();
  if (value < 1000000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  if (value < 1000000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
}

/**
 * Format currency with compact notation for large values
 * Examples: 32772 -> $32.8k, 528 -> $528
 */
export function formatCompactCurrency(value: number): string {
  if (value === 0) return '$0';
  if (value < 1000) {
    return '$' + Math.round(value).toString();
  }
  return '$' + formatCompactNumber(value);
}

/**
 * Format ROI multiplier
 * Examples: 18 -> 18×, 15.5 -> 15.5×
 * Note: ROI typically doesn't use compact notation (k/M)
 */
export function formatROI(value: number): string {
  if (value === 0) return '0×';
  // ROI doesn't use k/M suffix - show full number or with one decimal
  if (value >= 100) {
    return Math.round(value).toString() + '×';
  }
  return value.toFixed(1).replace(/\.0$/, '') + '×';
}

/**
 * Format percentage with consistent decimal places
 * Examples: 35.5 -> 35.5%, 4.567 -> 4.6%
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return value.toFixed(decimals).replace(/\.0$/, '') + '%';
}

/**
 * Format metric value based on type
 * This is the main formatter that should be used for dashboard cards
 */
export function formatMetric(value: number, type: 'currency' | 'number' | 'roi' | 'percentage'): string {
  switch (type) {
    case 'currency':
      return formatCompactCurrency(value);
    case 'roi':
      return formatROI(value);
    case 'percentage':
      return formatPercentage(value);
    case 'number':
    default:
      return formatCompactNumber(value);
  }
}

/**
 * Format count numbers (emails sent, conversions, etc.)
 * Uses compact notation for large numbers
 */
export function formatCount(value: number): string {
  return formatCompactNumber(value);
}

/**
 * Format revenue per recipient - special case
 * Shows decimals only when meaningful
 */
export function formatRevenuePerRecipient(value: number): string {
  if (value === 0) return '$0';
  if (value < 10) {
    return '$' + value.toFixed(2);
  }
  if (value < 1000) {
    return '$' + Math.round(value).toString();
  }
  return formatCompactCurrency(value);
}

// ============================================
// Time Formatting Utilities
// All times are converted from UTC to local time
// ============================================

/**
 * Convert UTC time string to local time string
 * @param utcTime - Time string in UTC (e.g., "15:00" or "2024-01-15T15:00:00Z")
 * @returns Local time string in HH:MM format
 */
export function convertUTCToLocalTime(utcTime: string): string {
  if (!utcTime) return '';
  
  // Handle time-only format (e.g., "15:00")
  if (utcTime.length === 5 && utcTime.includes(':')) {
    const today = new Date().toISOString().split('T')[0];
    const date = new Date(`${today}T${utcTime}:00Z`);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  // Handle full ISO format
  const date = new Date(utcTime);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Convert UTC date string to local date string
 * @param utcDate - Date string in UTC
 * @returns Local date string
 */
export function convertUTCToLocalDate(utcDate: string): string {
  if (!utcDate) return '';
  const date = new Date(utcDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get day name from UTC date string (converted to local timezone)
 * @param utcDate - Date string in UTC (e.g., "2026-03-11T00:00:00+00:00")
 * @returns Day name (Mon, Tue, Wed, etc.)
 */
export function getLocalDayName(utcDate: string): string {
  if (!utcDate) return '';
  
  // If it's already a day name (Mon, Tue, etc.), return as-is
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (dayNames.includes(utcDate)) {
    return utcDate;
  }
  
  // Parse the UTC date and convert to local timezone
  // The input is in ISO format with timezone (e.g., "2026-03-11T00:00:00+00:00")
  const date = new Date(utcDate);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', utcDate);
    return utcDate;
  }
  
  // Get day name in local timezone
  const dayName = date.toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  console.log('UTC Date:', utcDate, '-> Local Day:', dayName);
  return dayName;
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * Converts UTC to local time before calculating
 * @param timestamp - UTC timestamp string
 * @returns Relative time string
 */
export function formatTimeAgo(timestamp: string): string {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format full timestamp for display
 * Converts UTC to local time with full details
 * @param timestamp - UTC timestamp string
 * @returns Formatted local time string
 */
export function formatTimestampLocal(timestamp: string): string {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
