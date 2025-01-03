// useTelemetry.ts
import { useState, useEffect } from 'react';
import { TelemetryData, SystemStatus } from '../types/telemetry';
import FlightController from '../core/flight-control/FlightController';
import { SensorManager } from '../core/sensor-management/SensorManager';
import MotorController from '../core/flight-control/MotorController';
import { MissionManager } from '../core/mission-execution/MissionManager';
import SafetySystem from '../core/flight-control/SafetySystem';
import { EmergencyProcedure } from '../core/flight-control/EmergencyProcedures';

interface TelemetryHistoryItem {
  timestamp: number;
  data: TelemetryData;
}

interface TelemetrySubscription {
  unsubscribe: () => void;
}

export interface TelemetryHookResult {
  telemetry: TelemetryData | null;
  telemetryHistory: TelemetryHistoryItem[];
  systemStatus: SystemStatus | null;
  isConnected: boolean;
  error: Error | null;
  isInitializing: boolean;
}

export const useTelemetry = (): TelemetryHookResult => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryHistoryItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const sensorManager = new SensorManager();
    const motorController = new MotorController();
    const missionManager = new MissionManager();
    
    const emergencyProcedures: EmergencyProcedure[] = [
      { type: 'land', description: 'Emergency landing procedure' },
      { type: 'return_home', description: 'Return to home location' },
      { type: 'hover', description: 'Maintain current position' }
    ];
    
    const safetySystem = new SafetySystem(emergencyProcedures);
    const flightController = new FlightController(
      sensorManager,
      motorController,
      missionManager,
      safetySystem
    );

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
            procedures: emergencyProcedures
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
        }
        console.error('Failed to initialize telemetry:', error);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeTelemetry();

    let telemetrySubscription: TelemetrySubscription | null = null;

    try {
      const subscription = flightController.subscribeTelemetry({
        onTelemetryUpdate: (data: TelemetryData) => {
          if (mounted) {
            setTelemetry(data);
            setTelemetryHistory(prev => [...prev, {
              timestamp: Date.now(),
              data
            }].slice(-100));
          }
        },
        onSystemStatusUpdate: (status: SystemStatus) => {
          if (mounted) {
            setSystemStatus(status);
          }
        },
        onConnectionChange: (connected: boolean) => {
          if (mounted) {
            setIsConnected(connected);
          }
        }
      });

      telemetrySubscription = {
        unsubscribe: () => {
          console.log('Unsubscribing from telemetry');
        }
      };
    } catch (error) {
      if (mounted) {
        setError(error instanceof Error ? error : new Error('Failed to subscribe to telemetry'));
      }
      console.error('Failed to subscribe to telemetry:', error);
    }

    return () => {
      mounted = false;
      if (telemetrySubscription) {
        telemetrySubscription.unsubscribe();
      }
      flightController.cleanup();
    };
  }, []);

  return { telemetry, telemetryHistory, systemStatus, isConnected, error, isInitializing };
};