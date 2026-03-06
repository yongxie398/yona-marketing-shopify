'use client';

interface HeroInsightProps {
  headline: string;
  description: string;
  action: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export default function HeroInsight({ headline, description, action, impact }: HeroInsightProps) {
  const getBackgroundColor = () => {
    switch (impact) {
      case 'positive':
        return 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
      case 'negative':
        return 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
      default:
        return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
    }
  };

  const getBorderColor = () => {
    switch (impact) {
      case 'positive':
        return '#bbf7d0';
      case 'negative':
        return '#fecaca';
      default:
        return '#e2e8f0';
    }
  };

  const getIcon = () => {
    switch (impact) {
      case 'positive':
        return '🎉';
      case 'negative':
        return '⚠️';
      default:
        return '🤖';
    }
  };

  return (
    <div style={{ 
      background: getBackgroundColor(),
      borderRadius: '16px',
      border: `1px solid ${getBorderColor()}`,
      padding: '24px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>{getIcon()}</span>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: '700', 
            margin: 0,
            color: '#111827'
          }}>
            {headline}
          </h2>
        </div>
        <p style={{ 
          fontSize: '15px', 
          color: '#4b5563', 
          margin: '0 0 12px 0',
          lineHeight: '1.5'
        }}>
          {description}
        </p>
        <button style={{
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: impact === 'positive' ? '#16a34a' : '#008060',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}>
          {action}
        </button>
      </div>
      
      {/* Decorative AI visualization */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          fontSize: '36px'
        }}>
          🤖
        </div>
        <span style={{ 
          fontSize: '12px', 
          color: '#6b7280',
          fontWeight: '500'
        }}>
          AI Working
        </span>
      </div>
    </div>
  );
}
