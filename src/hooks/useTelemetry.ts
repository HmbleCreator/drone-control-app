import { useState, useEffect } from 'react';
import { TelemetryData } from '../types/telemetry';
import FlightController from '../core/flight-control/FlightController';
import { SensorManager } from '../core/sensor-management/SensorManager';
import MotorController from '../core/flight-control/MotorController';
import { MissionManager } from '../core/mission-execution/MissionManager';
import SafetySystem from '../core/flight-control/SafetySystem';
import { EmergencyProcedure } from '../core/flight-control/EmergencyProcedures';

export interface TelemetryHookResult {
  telemetry: TelemetryData | null;
  telemetryHistory: { timestamp: number; data: TelemetryData }[];
  isConnected: boolean;
  error: Error | null;
  isInitializing: boolean;
  getData: (timeRange: string) => Promise<TelemetryData[]>;
  subscribe: (callback: (data: TelemetryData) => void) => { unsubscribe: () => void };
  exportData: (format: string, startDate: Date, endDate: Date) => Promise<string>;
}

export const useTelemetry = (): TelemetryHookResult => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<{ timestamp: number; data: TelemetryData }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize flight controller and related systems
  const flightController = new FlightController(
    new SensorManager(),
    new MotorController(),
    new MissionManager(),
    new SafetySystem([
      { type: 'land', description: 'Emergency landing procedure' },
      { type: 'return_home', description: 'Return to home location' },
      { type: 'hover', description: 'Maintain current position' }
    ])
  );

  const getData = async (timeRange: string): Promise<TelemetryData[]> => {
    // Implementation based on your data storage/retrieval logic
    return telemetryHistory
      .filter(item => {
        const now = Date.now();
        switch (timeRange) {
          case '1h': return now - item.timestamp <= 3600000;
          case '24h': return now - item.timestamp <= 86400000;
          case '7d': return now - item.timestamp <= 604800000;
          default: return true;
        }
      })
      .map(item => item.data);
  };

  const subscribe = (callback: (data: TelemetryData) => void) => {
    const subscription = flightController.subscribeTelemetry({
      onTelemetryUpdate: (data: TelemetryData) => {
        callback(data);
        setTelemetryHistory(prev => [...prev, { timestamp: Date.now(), data }]);
      },
      onConnectionChange: setIsConnected
    });

    return {
      unsubscribe: () => {
        if (subscription?.unsubscribe) {
          subscription.unsubscribe();
        }
      }
    };
  };

  const exportData = async (format: string, startDate: Date, endDate: Date): Promise<string> => {
    // Implementation based on your export logic
    const filteredData = telemetryHistory.filter(
      item => item.timestamp >= startDate.getTime() && item.timestamp <= endDate.getTime()
    );

    // Simple implementation - you might want to enhance this
    if (format === 'csv') {
      // Convert to CSV
      return 'data:text/csv;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredData));
    }
    return 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredData));
  };

  useEffect(() => {
    let mounted = true;

    const initializeTelemetry = async () => {
      try {
        await flightController.initialize({
          updateFrequency: 10,
          safetyLimits: {
            maxAltitude: 120,
            maxVelocity: 10,
            maxAcceleration: 2,
            geofenceRadius: 100
          },
          emergencyProcedures: {
            procedures: [
              { type: 'land', description: 'Emergency landing procedure' },
              { type: 'return_home', description: 'Return to home location' },
              { type: 'hover', description: 'Maintain current position' }
            ]
          },
          sensors: {
            enabledSensors: new Set(['gps', 'imu', 'barometer']),
            updateRates: new Map([
              ['gps', 1],
              ['imu', 100],
              ['barometer', 10]
            ])
          }
        });

        if (mounted) {
          setIsConnected(true);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error : new Error('Failed to initialize telemetry'));
          console.error('Failed to initialize telemetry:', error);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeTelemetry();

    return () => {
      mounted = false;
      flightController.cleanup();
    };
  }, []);

  return {
    telemetry,
    telemetryHistory,
    isConnected,
    error,
    isInitializing,
    getData,
    subscribe,
    exportData
  };
};