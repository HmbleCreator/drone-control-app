// useTelemetry.ts
import { useState, useEffect } from 'react';
import { TelemetryData, SystemStatus } from '../types/telemetry';
import FlightController from '../core/flight-control/FlightController';

export const useTelemetry = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const flightController = new FlightController();
    let mounted = true;

    const initializeTelemetry = async () => {
      try {
        await flightController.initialize({
            updateFrequency: 10, // 10Hz telemetry updates
            safetyLimits: {
                maxAltitude: 120, // meters
                maxVelocity: 10, // m/s
                maxAcceleration: 2, // m/s^2
                geofenceRadius: 100 // meters
            },
            emergencyProcedures: undefined
        });

        if (mounted) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Failed to initialize telemetry:', error);
      }
    };

    initializeTelemetry();

    const telemetrySubscription = flightController.subscribeTelemetry({
      onTelemetryUpdate: (data) => {
        if (mounted) {
          setTelemetry(data);
        }
      },
      onSystemStatusUpdate: (status) => {
        if (mounted) {
          setSystemStatus(status);
        }
      },
      onConnectionChange: (connected) => {
        if (mounted) {
          setIsConnected(connected);
        }
      }
    });

    return () => {
      mounted = false;
      telemetrySubscription.unsubscribe();
      flightController.cleanup();
    };
  }, []);

  return { telemetry, systemStatus, isConnected };
};