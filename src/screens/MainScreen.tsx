// MainScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { AttitudeIndicator } from '../components/flight/AttitudeIndicator';
import { TelemetryGauge } from '../components/flight/TelemetryGauge';
import { EmergencyControls } from '../components/flight/EmergencyControls';
import { useTelemetry } from '../hooks/useTelemetry';
import { useLocation } from '../hooks/useLocation';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import type { DroneState } from '../types/telemetry';
import FlightController from '../core/flight-control/FlightController';

export const MainScreen: React.FC = () => {
  const { telemetry, isConnected } = useTelemetry();
  const { location } = useLocation();
  const [droneState, setDroneState] = useState<DroneState>('IDLE');

  const handleEmergencyLand = async () => {
    try {
      await FlightController.emergencyLand();
      setDroneState('EMERGENCY_LANDING');
    } catch (error) {
      console.error('Emergency landing failed:', error);
    }
  };

  const handleReturnHome = async () => {
    try {
      await FlightController.returnToHome();
      setDroneState('RETURNING');
    } catch (error) {
      console.error('Return to home failed:', error);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await FlightController.emergencyStop();
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
        <Card style={styles.telemetryCard}>
          <AttitudeIndicator
            pitch={telemetry.pitch}
            roll={telemetry.roll}
            size={200}
          />
        </Card>

        <View style={styles.gaugesContainer}>
          <TelemetryGauge
            label="Altitude"
            value={telemetry.altitude}
            unit="m"
            min={0}
            max={120}
            warningThreshold={100}
            criticalThreshold={110}
          />
          <TelemetryGauge
            label="Battery"
            value={telemetry.batteryPercentage}
            unit="%"
            min={0}
            max={100}
            warningThreshold={20}
            criticalThreshold={10}
          />
          <TelemetryGauge
            label="Signal"
            value={telemetry.signalStrength}
            unit="%"
            min={0}
            max={100}
            warningThreshold={40}
            criticalThreshold={20}
          />
        </View>

        <EmergencyControls
          onEmergencyLand={handleEmergencyLand}
          onReturnHome={handleReturnHome}
          onEmergencyStop={handleEmergencyStop}
          isConnected={isConnected}
        />
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
  telemetryCard: {
    padding: 16,
  },
  gaugesContainer: {
    gap: 8,
  },
});