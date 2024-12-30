// hooks/useSensors.ts
import { useState, useEffect } from 'react';
import { SensorData, IMUData, GPSData } from '../types/sensor';
import SensorManager from '../core/sensor-management/SensorManager';
import SensorFusionEngine  from '../core/sensor-management/SensorFusionEngine';

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

        // Start sensor calibration
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

    const sensorSubscription = sensorManager.subscribe((rawData) => {
      if (mounted) {
        // Process raw sensor data through fusion engine
        const fusedData = fusionEngine.processSensorData(rawData);
        setSensorData(fusedData);
      }
    });

    return () => {
      mounted = false;
      sensorSubscription.unsubscribe();
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
