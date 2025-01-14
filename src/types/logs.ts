// types/logs.ts
export type LogType = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;  // Changed from 'type' to 'level' to be consistent
  message: string;
  details?: string;
  data?: any;
}

export interface LogFilters {
  searchText?: string;
  logLevels: LogType[];
  startDate?: Date;
  endDate?: Date;
}

export interface LogStorageInterface {
  getLogsBetweenDates(startTime: number, endTime: number): Promise<LogEntry[]>;
  storeLogs(logs: LogEntry[]): Promise<void>;
  clearOldLogs(maxAge: number): Promise<void>;
}