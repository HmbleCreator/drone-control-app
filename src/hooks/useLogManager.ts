// hooks/useLogManager.ts
import { useCallback } from 'react';
import { LogStorage } from '../services/storage/LogStorage';
import { LogEntry, LogLevel } from '../types/logs';

export const useLogManager = () => {
  const getLogs = useCallback(async (startTime?: number, endTime?: number) => {
    try {
      const end = endTime || Date.now();
      const start = startTime || end - (24 * 60 * 60 * 1000);
      
      return await LogStorage.getLogsBetweenDates(start, end);
    } catch (error) {
      console.error('Error in useLogManager.getLogs:', error);
      throw error;
    }
  }, []);

  const addLog = useCallback(async (
    message: string,
    level: LogLevel = LogLevel.INFO,
    details?: string,
    data?: any
  ) => {
    const newLog: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      details,
      data
    };

    await LogStorage.storeLogs([newLog]);
    return newLog;
  }, []);

  const clearOldLogs = useCallback(async (maxAge: number) => {
    await LogStorage.clearOldLogs(maxAge);
  }, []);

  const clearLogs = useCallback(async () => {
    await LogStorage.clearAllLogs();
  }, []);

  const exportLogs = useCallback(async () => {
    const logs = await getLogs();
    // Implement your export logic here (e.g., save to a file, send to a server, etc.)
    console.log('Logs exported:', logs);
  }, [getLogs]);

  return {
    getLogs,
    addLog,
    clearOldLogs,
    clearLogs,
    exportLogs
  };
};
