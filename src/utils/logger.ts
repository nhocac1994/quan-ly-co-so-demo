// Logger utility để quản lý logging level
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel = LogLevel.ERROR; // Chỉ hiển thị errors mặc định

  setLevel(level: LogLevel) {
    this.level = level;
  }

  error(...args: any[]) {
    if (this.level >= LogLevel.ERROR) {
      console.error(...args);
    }
  }

  warn(...args: any[]) {
    if (this.level >= LogLevel.WARN) {
      console.warn(...args);
    }
  }

  info(...args: any[]) {
    if (this.level >= LogLevel.INFO) {
      console.log(...args);
    }
  }

  debug(...args: any[]) {
    if (this.level >= LogLevel.DEBUG) {
      console.log(...args);
    }
  }
}

export const logger = new Logger();

// Set level dựa trên environment
if (process.env.NODE_ENV === 'development') {
  logger.setLevel(LogLevel.ERROR); // Chỉ hiển thị errors trong development
} else {
  logger.setLevel(LogLevel.ERROR); // Chỉ hiển thị errors trong production
} 