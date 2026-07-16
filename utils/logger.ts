/**
 * Logger Utility
 * Replaces console.log with environment-aware logging
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };
  }

  private addToHistory(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }
  }

  /**
   * General log - only in development
   */
  log(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, ...args);
      this.addToHistory(this.createEntry('log', message, args));
    }
  }

  /**
   * Info log - only in development
   */
  info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
      this.addToHistory(this.createEntry('info', message, args));
    }
  }

  /**
   * Warning - always logged
   */
  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
    this.addToHistory(this.createEntry('warn', message, args));
  }

  /**
   * Error - always logged
   */
  error(message: string, error?: Error | any, ...args: any[]) {
    console.error(`[ERROR] ${message}`, error, ...args);
    this.addToHistory(this.createEntry('error', message, { error, args }));
    
    // TODO: Send to error tracking service (Sentry, etc.)
    // this.sendToErrorTracking(message, error);
  }

  /**
   * Debug - only in development
   */
  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
      this.addToHistory(this.createEntry('debug', message, args));
    }
  }

  /**
   * Get log history (for debugging)
   */
  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logs = [];
  }

  /**
   * Export logs (for debugging)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for backward compatibility
export default logger;
