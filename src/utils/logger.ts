// Logging utility for consistent logging across the application

interface LogOptions {
  context?: string;
  error?: Error;
  metadata?: any;
}

class Logger {
  private logLevel: string;

  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: string, message: string, options: LogOptions = {}): string {
    const { context, error, metadata } = options;
    const now = new Date();
    // Format timestamp in local timezone: YYYY-MM-DD HH:mm:ss
    const timestamp = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
    let formatted = `${timestamp} [${level.toUpperCase()}]`;
    
    if (context) {
      formatted += ` [${context}]`;
    }
    
    formatted += ` ${message}`;
    
    if (error) {
      formatted += ` - Error: ${error.message}`;
      if (error.stack) {
        formatted += `\n${error.stack}`;
      }
    }
    
    if (metadata) {
      formatted += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
    }
    
    return formatted;
  }

  debug(message: string, options: LogOptions = {}): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, options));
    }
  }

  info(message: string, options: LogOptions = {}): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, options));
    }
  }

  warn(message: string, options: LogOptions = {}): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, options));
    }
  }

  error(message: string, options: LogOptions = {}): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, options));
    }
  }
}

export default new Logger();