// src/components/flight/EmergencyControls.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../common/Button';

interface EmergencyControlsProps {
  onEmergencyLand: () => Promise<void>;
  onReturnHome: () => Promise<void>;
  onEmergencyStop: () => Promise<void>;
  isConnected: boolean;
}

export const EmergencyControls: React.FC<EmergencyControlsProps> = ({
  onEmergencyLand,
  onReturnHome,
  onEmergencyStop,
  isConnected
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEmergencyAction = async (
    action: () => Promise<void>,
    confirmMessage: string
  ) => {
    Alert.alert(
      'Confirm Emergency Action',
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await action();
            } catch (error) {
              Alert.alert('Error', 'Failed to execute emergency action');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {!isConnected && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Connection Lost - Limited Control Available
          </Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button
          variant="warning"
          onPress={() => handleEmergencyAction(
            onEmergencyLand,
            'Initiate emergency landing sequence?'
          )}
          disabled={isProcessing || !isConnected}
        >
          Emergency Land
        </Button>

        <Button
          variant="warning"
          onPress={() => handleEmergencyAction(
            onReturnHome,
            'Return to home location?'
          )}
          disabled={isProcessing || !isConnected}
        >
          Return to Home
        </Button>

        <Button
          variant="danger"
          onPress={() => handleEmergencyAction(
            onEmergencyStop,
            'EMERGENCY STOP - All motors will stop immediately. This may cause the drone to fall. Continue?'
          )}
          disabled={isProcessing}
        >
          EMERGENCY STOP
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    color: '#92400E',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 8,
  }
});