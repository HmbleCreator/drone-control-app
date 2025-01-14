import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { useFlightController } from '../../../src/hooks/useFlightController';
import { useTelemetry } from '../../../src/hooks/useTelemetry';
import { AttitudeIndicator } from './AttitudeIndicator';
import TelemetryPanel from './TelemetryPanel';
import { Button } from '../../../src/components/common/Button';
import { FlightMode } from '../../../src/types/telemetry';

interface FlightScreenProps {
  onEmergencyStop?: () => void;
  onModeChange?: (mode: FlightMode) => void;
}

const FlightScreen: React.FC<FlightScreenProps> = ({
  onEmergencyStop,
  onModeChange,
}) => {
  const {
    deviceId,
    isArmed,
    currentMode,
    connect,
    disconnect,
    arm,
    disarm,
    setMode,
    emergencyStop
  } = useFlightController();

  const { telemetry, isConnected } = useTelemetry();

  const [batteryLevel, setBatteryLevel] = useState(100);
  const [signalStrength, setSignalStrength] = useState(0);
  const [attitude, setAttitude] = useState({ pitch: 0, roll: 0, yaw: 0 });

  useEffect(() => {
    if (telemetry) {
      setBatteryLevel(telemetry.sensorData.battery.percentage);
      setSignalStrength(telemetry.systemStatus.dataLinkStatus.signalStrength);
      setAttitude({
        pitch: telemetry.attitude.pitch,
        roll: telemetry.attitude.roll,
        yaw: telemetry.attitude.yaw
      });
    }
  }, [telemetry]);

  const handleConnect = async (newDeviceId: string) => {
    try {
      await connect(newDeviceId);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to device');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      Alert.alert('Error', 'Failed to disconnect from device');
    }
  };

  const handleArm = async () => {
    try {
      if (isArmed) {
        await disarm();
      } else {
        await arm();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to arm/disarm vehicle');
    }
  };

  const handleEmergency = async () => {
    try {
      await emergencyStop();
      onEmergencyStop?.();
    } catch (error) {
      Alert.alert('Error', 'Emergency stop failed');
    }
  };

  const handleModeChange = async (newMode: FlightMode) => {
    try {
      await setMode(newMode);
      onModeChange?.(newMode);
    } catch (error) {
      Alert.alert('Error', 'Failed to change flight mode');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Attitude Indicator */}
      <View style={styles.attitudeContainer}>
        <AttitudeIndicator 
          pitch={attitude.pitch}
          roll={attitude.roll}
          yaw={attitude.yaw}
        />
      </View>

      {/* Arm and Emergency Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleArm}
          style={isArmed ? styles.dangerButton : styles.successButton}
        >
          {isArmed ? "DISARM" : "ARM"}
        </Button>
        
        <Button
          onPress={handleEmergency}
          style={styles.emergencyButton}
        >
          EMERGENCY STOP
        </Button>
      </View>

      {/* Scrollable Data Panel */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TelemetryPanel
          telemetryData={telemetry || undefined}
          armed={isArmed}
          mode={currentMode}
          onModeChange={handleModeChange}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  attitudeContainer: {
    padding: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  successButton: {
    backgroundColor: '#44bb44',
    flex: 1,
    marginRight: 8,
  },
  dangerButton: {
    backgroundColor: '#ff4444',
    flex: 1,
    marginRight: 8,
  },
  emergencyButton: {
    backgroundColor: '#ff0000',
    flex: 1,
    marginLeft: 8,
  },
  scrollViewContent: {
    padding: 16,
    backgroundColor: '#000',
  },
});

export default FlightScreen;
