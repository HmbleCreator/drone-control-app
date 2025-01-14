import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { Text } from '../components/ui/text';
import { Button } from '../components/common/Button';
import { AttitudeIndicator } from '../components/flight/AttitudeIndicator';
import { TelemetryGauge } from '../components/flight/TelemetryGauge';
import { EmergencyControls } from '../components/flight/EmergencyControls';
import { useTelemetry } from '../hooks/useTelemetry';
import { Loading } from '../components/common/Loading';
import FlightController from '../core/flight-control/FlightController';
import { SensorManager } from '../core/sensor-management/SensorManager';
import MotorController from '../core/flight-control/MotorController';
import { MissionManager } from '../core/mission-execution/MissionManager';
import SafetySystem from '../core/flight-control/SafetySystem';

// Define types
type EmergencyProcedure = {
  type: 'land' | 'return_home' | 'hover';
};

type DroneState = 'IDLE' | 'EMERGENCY_LANDING' | 'RETURNING' | 'STOPPED';

export const MainScreen: React.FC = () => {
  const { telemetry, isConnected } = useTelemetry();
  const [droneState, setDroneState] = useState<DroneState>('IDLE');

  // Initialize controller with required dependencies
  const [flightController] = useState(() => {
    const sensorManager = new SensorManager();
    const motorController = new MotorController();
    const missionManager = new MissionManager();

    const emergencyProcedures: EmergencyProcedure[] = [
      { type: 'land' },
      { type: 'return_home' },
      { type: 'hover' }
    ];

    const safetySystem = new SafetySystem(emergencyProcedures);

    return new FlightController(
      sensorManager,
      motorController,
      missionManager,
      safetySystem
    );
  });

  useEffect(() => {
    const initializeController = async () => {
      try {
        await flightController.initialize({
          updateFrequency: 100,
          safetyLimits: {
            maxAltitude: 120,
            maxVelocity: 15,
            maxAcceleration: 4,
            geofenceRadius: 100,
          },
          emergencyProcedures: {
            procedures: [
              { type: 'land' },
              { type: 'return_home' },
              { type: 'hover' }
            ]
          },
          sensors: {
            enabledSensors: new Set(['GPS', 'IMU', 'ALTIMETER']),
            updateRates: new Map([
              ['GPS', 1],
              ['IMU', 100],
              ['ALTIMETER', 10]
            ])
          }
        });
      } catch (error) {
        console.error('Failed to initialize flight controller:', error);
      }
    };

    initializeController();
    return () => {
      flightController.cleanup();
    };
  }, [flightController]);

  const handleEmergencyLand = async () => {
    try {
      await flightController.executeEmergencyProcedure({ type: 'land' });
      setDroneState('EMERGENCY_LANDING');
    } catch (error) {
      console.error('Emergency landing failed:', error);
    }
  };

  const handleReturnHome = async () => {
    try {
      await flightController.executeEmergencyProcedure({ type: 'return_home' });
      setDroneState('RETURNING');
    } catch (error) {
      console.error('Return to home failed:', error);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await flightController.endFlight();
      setDroneState('STOPPED');
    } catch (error) {
      console.error('Emergency stop failed:', error);
    }
  };

  if (!telemetry) {
    return <Loading text="Initializing drone systems..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, 
            { color: isConnected ? '#059669' : '#DC2626' }]}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </Text>
          <Text style={styles.stateText}>
            State: {droneState}
          </Text>
        </View>

        {/* Attitude Indicator Card */}
        <View style={styles.telemetryCard}>
          <Text variant="heading" style={styles.cardTitle}>
            Flight Attitude
          </Text>
          <AttitudeIndicator
            pitch={telemetry.attitude.pitch}
            roll={telemetry.attitude.roll}
            size={200}
          />
        </View>

        {/* Telemetry Gauges */}
        <View style={styles.gaugesContainer}>
          <TelemetryGauge
            label="Altitude"
            value={telemetry.locationData.verticalSpeed}
            unit="m"
            min={0}
            max={120}
            warningThreshold={100}
            criticalThreshold={110}
          />
          <TelemetryGauge
            label="Battery"
            value={telemetry.sensorData.battery.percentage}
            unit="%"
            min={0}
            max={100}
            warningThreshold={20}
            criticalThreshold={10}
          />
          <TelemetryGauge
            label="Signal"
            value={telemetry.systemStatus.rcSignalStrength}
            unit="%"
            min={0}
            max={100}
            warningThreshold={40}
            criticalThreshold={20}
          />
        </View>

        {/* Emergency Controls */}
        <View style={styles.emergencyContainer}>
          <Text variant="heading" style={styles.cardTitle}>
            Emergency Controls
          </Text>
          <EmergencyControls
            onEmergencyLand={handleEmergencyLand}
            onReturnHome={handleReturnHome}
            onEmergencyStop={handleEmergencyStop}
            isConnected={isConnected}
          />
          <Button
            onPress={handleEmergencyLand}
            variant="danger"
            size="sm"
            style={styles.button}
          >
            Emergency Land
          </Button>
          <Button
            onPress={handleReturnHome}
            variant="warning"
            size="sm"
            style={styles.button}
          >
            Return Home
          </Button>
          <Button
            onPress={handleEmergencyStop}
            variant="secondary"
            size="sm"
            style={styles.button}
          >
            Emergency Stop
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  telemetryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: 12,
  },
  gaugesContainer: {
    gap: 8,
  },
  emergencyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    marginVertical: 4,
  }
});

export default MainScreen;
