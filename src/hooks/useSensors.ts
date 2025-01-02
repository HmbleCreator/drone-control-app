// hooks/useSensors.ts
import { useState, useEffect } from 'react';
import { SensorManager } from '../core/sensor-management/SensorManager';
import { SensorFusionEngine } from '../core/sensor-management/SensorFusionEngine';

interface SensorData {
  // Define your sensor data structure here
  latitude?: number;
  longitude?: number;
  altitude?: number;
  roll?: number;
  pitch?: number;
  yaw?: number;
  timestamp?: number;
}

export const useSensors = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [calibrationStatus, setCalibrationStatus] = useState<'none' | 'in-progress' | 'completed' | 'failed'>('none');

  useEffect(() => {
    const sensorManager = new SensorManager();
    const fusionEngine = new SensorFusionEngine();
    let mounted = true;

    const initializeSensors = async () => {
      try {
        await sensorManager.initialize({
          enabledSensors: new Set(['IMU', 'GPS', 'BAROMETER']),
          updateRates: new Map([
            ['IMU', 50],    // 50Hz
            ['GPS', 1],     // 1Hz
            ['BAROMETER', 10] // 10Hz
          ]),
          fusionAlgorithm: 'KALMAN'
        });

        if (mounted) {
          setIsInitialized(true);
        }

        setCalibrationStatus('in-progress');
        await sensorManager.calibrateSensors();
        
        if (mounted) {
          setCalibrationStatus('completed');
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize sensors'));
          setCalibrationStatus('failed');
        }
      }
    };

    initializeSensors();

    const subscription = sensorManager.subscribe((rawData: any) => {
      if (mounted) {
        const processedData = fusionEngine.processSensorData(rawData);
        setSensorData(processedData);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      sensorManager.cleanup();
    };
  }, []);

  return {
    sensorData,
    isInitialized,
    error,
    calibrationStatus,
    isSensorHealthy: sensorData !== null && !error
  };
};