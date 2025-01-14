import { useState, useCallback, useEffect } from 'react';
import FlightController from '../core/flight-control/FlightController';
import { SensorManager } from '../core/sensor-management/SensorManager';
import MotorController from '../core/flight-control/MotorController';
import { MissionManager } from '../core/mission-execution/MissionManager';
import SafetySystem from '../core/flight-control/SafetySystem';
import { EmergencyProcedure } from '../core/flight-control/EmergencyProcedures';
import { FlightMode, ArmingState, TelemetryData } from '../types/telemetry';

interface FlightControllerState {
  isInitialized: boolean;
  isArmed: boolean;
  currentMode: FlightMode;
  telemetryData: TelemetryData | null;
  error: Error | null;
}

interface FlightControllerHookResult {
  deviceId: string;
  isInitialized: boolean;
  isArmed: boolean;
  currentMode: FlightMode;
  telemetryData: TelemetryData | null;
  error: Error | null;
  initialize: () => Promise<void>;
  connect: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  arm: () => Promise<void>;
  disarm: () => Promise<void>;
  setMode: (mode: FlightMode) => Promise<void>;
  emergencyStop: () => Promise<void>;
}

export function useFlightController(): FlightControllerHookResult {
  const [controller] = useState(() => {
    const sensorManager = new SensorManager();
    const motorController = new MotorController();
    const missionManager = new MissionManager();
    
    const emergencyProcedures: EmergencyProcedure[] = [
      { type: 'land', description: 'Emergency landing procedure' },
      { type: 'return_home', description: 'Return to home location' },
      { type: 'hover', description: 'Maintain current position' }
    ];
    
    const safetySystem = new SafetySystem(emergencyProcedures);
    
    return new FlightController(
      sensorManager,
      motorController,
      missionManager,
      safetySystem
    );
  });


  const [state, setState] = useState<FlightControllerState>({
    isInitialized: false,
    isArmed: false,
    currentMode: FlightMode.ASSISTED,
    telemetryData: null,
    error: null
  });

  const [deviceId, setDeviceId] = useState<string>('');

  // Initialize flight controller
  const initialize = useCallback(async () => {
    try {
      await controller.initialize({
        updateFrequency: 100,
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

      setState(prev => ({
        ...prev,
        isInitialized: true,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to initialize flight controller')
      }));
      throw error;
    }
  }, [controller]);

  // Connection management with deviceId parameter
  const connect = useCallback(async (deviceId: string) => {
    try {
      // Implement connection logic here using the provided deviceId
      setDeviceId(deviceId);
      setState(prev => ({ ...prev, error: null }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to connect')
      }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      // Implement disconnection logic here
      setDeviceId('');
      setState(prev => ({ ...prev, error: null }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to disconnect')
      }));
      throw error;
    }
  }, []);

  // Flight control actions
  const arm = useCallback(async () => {
    try {
      // Add arming logic here (e.g., motor checks, sensor validation)
      setState(prev => ({ ...prev, isArmed: true, error: null }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to arm')
      }));
      throw error;
    }
  }, []);

  const disarm = useCallback(async () => {
    try {
      await controller.endFlight();
      setState(prev => ({ ...prev, isArmed: false, error: null }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to disarm')
      }));
      throw error;
    }
  }, [controller]);

  const setMode = useCallback(async (mode: FlightMode) => {
    try {
      // Implement mode switching logic here
      setState(prev => ({ ...prev, currentMode: mode, error: null }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to set mode')
      }));
      throw error;
    }
  }, []);

  const emergencyStop = useCallback(async () => {
    try {
      await controller.executeEmergencyProcedure({ type: 'land' });
      setState(prev => ({ 
        ...prev, 
        isArmed: false, 
        currentMode: FlightMode.EMERGENCY,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Emergency stop failed')
      }));
      throw error;
    }
  }, [controller]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controller.cleanup();
    };
  }, [controller]);

  return {
    deviceId,
    isInitialized: state.isInitialized,
    isArmed: state.isArmed,
    currentMode: state.currentMode,
    telemetryData: state.telemetryData,
    error: state.error,
    initialize,
    connect,
    disconnect,
    arm,
    disarm,
    setMode,
    emergencyStop
  };
}

export default useFlightController;