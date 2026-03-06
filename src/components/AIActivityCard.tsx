'use client';

interface AIActivityCardProps {
  type: 'monitoring' | 'email' | 'optimization' | 'insight' | 'decision';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'completed' | 'pending';
  result?: string;
}

export default function AIActivityCard({ 
  type, 
  title, 
  description, 
  timestamp, 
  status,
  result 
}: AIActivityCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'monitoring':
        return '👁️';
      case 'email':
        return '✉️';
      case 'optimization':
        return '⚡';
      case 'insight':
        return '💡';
      case 'decision':
        return '🎯';
      default:
        return '🤖';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return '#3b82f6';
      case 'completed':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      default:
        return '';
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '16px',
      display: 'flex',
      gap: '16px',
      transition: 'all 0.2s ease',
      cursor: 'default'
    }}>
      {/* Icon */}
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0
      }}>
        {getIcon()}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '4px'
        }}>
          <h3 style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            margin: 0,
            color: '#111827'
          }}>
            {title}
          </h3>
          <span style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            whiteSpace: 'nowrap'
          }}>
            {timestamp}
          </span>
        </div>
        
        <p style={{ 
          fontSize: '14px', 
          color: '#4b5563', 
          margin: '0 0 8px 0',
          lineHeight: '1.4'
        }}>
          {description}
        </p>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Status Badge */}
          <span style={{
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            backgroundColor: `${getStatusColor()}15`,
            color: getStatusColor()
          }}>
            {status === 'active' && (
              <span style={{ 
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(),
                marginRight: '4px',
                animation: 'pulse 2s infinite'
              }} />
            )}
            {getStatusLabel()}
          </span>

          {/* Result Badge */}
          {result && (
            <span style={{
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              backgroundColor: '#dcfce7',
              color: '#166534'
            }}>
              {result}
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
