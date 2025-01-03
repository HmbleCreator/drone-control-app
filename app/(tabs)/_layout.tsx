// app/(tabs)/index.tsx
import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AttitudeIndicator } from '../../src/components/flight/AttitudeIndicator';
import { TelemetryGauge } from '../../src/components/flight/TelemetryGauge';
import { EmergencyControls } from '../../src/components/flight/EmergencyControls';
import { Card } from '../../src/components/common/Card';
import { useTelemetry } from '../../src/hooks/useTelemetry';
import { Loading } from '../../src/components/common/Loading';
import { ErrorView } from '../../src/components/common/ErrorView';

export default function MainScreen() {
  const { 
    telemetry, 
    isConnected, 
    error: telemetryError, 
    isInitializing 
  } = useTelemetry();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (telemetryError) {
      setError('Failed to connect to drone telemetry system');
    } else {
      setError(null);
    }
  }, [telemetryError]);

  const handleEmergencyLand = async () => {
    try {
      Alert.alert(
        'Emergency Landing',
        'Are you sure you want to initiate emergency landing?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: async () => {
              try {
                // TODO: API call placeholder
                Alert.alert(
                  'Emergency Landing Initiated',
                  'The drone is beginning emergency landing procedure'
                );
              } catch (error) {
                console.error('Failed to execute emergency landing:', error);
                Alert.alert(
                  'Emergency Landing Failed',
                  'Unable to initiate emergency landing. Please try emergency stop if situation is critical.'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Emergency landing handler failed:', error);
    }
  };

  const handleReturnHome = async () => {
    try {
      Alert.alert(
        'Return to Home',
        'Are you sure you want to return to home position?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: async () => {
              try {
                // TODO: API call placeholder
                Alert.alert(
                  'Return Home Initiated',
                  'The drone is beginning return to home procedure'
                );
              } catch (error) {
                console.error('Failed to execute return to home:', error);
                Alert.alert(
                  'Return Home Failed',
                  'Unable to initiate return to home. Please try emergency landing.'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Return home handler failed:', error);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      Alert.alert(
        'EMERGENCY STOP',
        'WARNING: This will immediately stop all motors. The drone will fall if airborne. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'STOP ALL MOTORS',
            style: 'destructive',
            onPress: async () => {
              try {
                // TODO: API call placeholder
                Alert.alert('Emergency Stop Executed', 'All motors have been stopped');
              } catch (error) {
                console.error('Failed to execute emergency stop:', error);
                Alert.alert(
                  'Emergency Stop Failed',
                  'CRITICAL: Unable to stop motors. If situation is critical, please contact emergency services.',
                  [
                    { text: 'OK', style: 'cancel' },
                    {
                      text: 'Retry Stop',
                      style: 'destructive',
                      onPress: handleEmergencyStop
                    }
                  ]
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Emergency stop handler failed:', error);
    }
  };

  if (isInitializing) {
    return <Loading text="Initializing drone systems..." />;
  }

  if (error) {
    return <ErrorView 
      message={error}
      onRetry={() => {
        setError(null);
        // Trigger telemetry reconnection here if needed
      }}
    />;
  }

  if (!telemetry) {
    return <Loading text="Connecting to drone..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Card variant="default" className="flex-1">
          <AttitudeIndicator 
            pitch={telemetry.attitude.pitch}
            roll={telemetry.attitude.roll}
            size={200}
          />
        </Card>
      </View>

      <View style={styles.middleSection}>
        <TelemetryGauge 
          label="Altitude"
          value={telemetry.attitude}
          unit="m"
          min={0}
          max={120}
          warningThreshold={100}
          criticalThreshold={110}
        />
        <TelemetryGauge 
          label="Speed"
          value={telemetry.groundSpeed}
          unit="m/s"
          min={0}
          max={30}
          warningThreshold={25}
          criticalThreshold={28}
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
      </View>

      <View style={styles.bottomSection}>
        <EmergencyControls 
          onEmergencyLand={handleEmergencyLand}
          onReturnHome={handleReturnHome}
          onEmergencyStop={handleEmergencyStop}
          isConnected={isConnected}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topSection: {
    flex: 2,
    padding: 16,
  },
  middleSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  bottomSection: {
    flex: 1,
    padding: 16,
  },
});