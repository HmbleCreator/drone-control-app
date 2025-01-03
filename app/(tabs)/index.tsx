// app/(tabs)/index.tsx
import { Alert } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AttitudeIndicator } from '../../src/components/flight/AttitudeIndicator';
import { TelemetryGauge } from '../../src/components/flight/TelemetryGauge';
import { EmergencyControls } from '../../src/components/flight/EmergencyControls';
import { Card } from '../../src/components/common/Card';

export default function MainScreen() {
  const handleEmergencyLand = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Emergency Landing',
        'Are you sure you want to initiate emergency landing?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: async () => {
              try {
                // TODO: Replace with your actual API calls
                // Example:
                // await api.drone.emergencyLand();
                
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
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: async () => {
              try {
                // TODO: Replace with your actual API calls
                // Example:
                // await api.drone.returnToHome();
                
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
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'STOP ALL MOTORS',
            style: 'destructive',
            onPress: async () => {
              try {
                // TODO: Replace with your actual API calls
                // Example:
                // await api.drone.emergencyStop();
                
                Alert.alert(
                  'Emergency Stop Executed',
                  'All motors have been stopped'
                );
              } catch (error) {
                console.error('Failed to execute emergency stop:', error);
                Alert.alert(
                  'Emergency Stop Failed',
                  'CRITICAL: Unable to stop motors. If situation is critical, please contact emergency services.',
                  [
                    {
                      text: 'OK',
                      style: 'cancel'
                    },
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Card variant="default" className="flex-1">
          <AttitudeIndicator 
            pitch={0} 
            roll={0}
          />
        </Card>
      </View>

      <View style={styles.middleSection}>
        <TelemetryGauge 
          label="Altitude"
          value={0}
          unit="m"
          min={0}
          max={100}
          warningThreshold={80}
          criticalThreshold={90}
        />
        <TelemetryGauge 
          label="Speed"
          value={0}
          unit="m/s"
          min={0}
          max={30}
          warningThreshold={25}
          criticalThreshold={28}
        />
        <TelemetryGauge 
          label="Battery"
          value={100}
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
          isConnected={true}
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