// services/storage/LogStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AsyncStorageService } from "./AsyncStorageService";
import { LogEntry } from "../../types/logs";

interface LogBatch {
  startTime: number;
  endTime: number;
  entries: LogEntry[];
}

export class LogStorage {
  private static readonly MAX_BATCH_SIZE = 1000;
  private static readonly STORAGE_KEY_PREFIX = 'drone_logs_';

  static async storeLogs(entries: LogEntry[]): Promise<void> {
    const batchId = Date.now();
    const batch: LogBatch = {
      startTime: entries[0]?.timestamp || Date.now(),
      endTime: entries[entries.length - 1]?.timestamp || Date.now(),
      entries
    };

    await AsyncStorageService.set(
      `${this.STORAGE_KEY_PREFIX}${batchId}`,
      batch
    );
  }

  static async getLogsBetweenDates(
    startTime: number,
    endTime: number
  ): Promise<LogEntry[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));
      
      let allLogs: LogEntry[] = [];
      
      for (const key of logKeys) {
        const batch = await AsyncStorageService.get<LogBatch>(key);
        if (batch && batch.startTime >= startTime && batch.endTime <= endTime) {
          allLogs = [...allLogs, ...batch.entries];
        }
      }

      return allLogs.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error retrieving logs:', error);
      throw new Error('Failed to retrieve logs');
    }
  }

  static async clearOldLogs(maxAge: number): Promise<void> {
    const cutoffTime = Date.now() - maxAge;
    const keys = await AsyncStorage.getAllKeys();
    const logKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));

    for (const key of logKeys) {
      const batch = await AsyncStorageService.get<LogBatch>(key);
      if (batch && batch.endTime < cutoffTime) {
        await AsyncStorageService.remove(key);
      }
    }
  }

  static async clearAllLogs(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));

      for (const key of logKeys) {
        await AsyncStorageService.remove(key);
      }
    } catch (error) {
      console.error('Failed to clear all logs', error);
      throw error;
    }
  }
}
