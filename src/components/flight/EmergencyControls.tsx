// EmergencyControls.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
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
    <View className="space-y-4 p-4 bg-red-50 rounded-lg border-2 border-red-500">
      <Text className="text-xl font-bold text-red-700">Emergency Controls</Text>
      
      <View className="space-y-2">
        {!isConnected && (
          <Text className="text-red-600 font-bold">
            ⚠️ Connection Lost - Limited Control Available
          </Text>
        )}
        
        <Button
          variant="danger"
          disabled={isProcessing}
          onPress={() => handleEmergencyAction(
            onEmergencyLand,
            'Initiate emergency landing sequence?'
          )}
        >
          Emergency Land
        </Button>

        <Button
          variant="warning"
          disabled={isProcessing || !isConnected}
          onPress={() => handleEmergencyAction(
            onReturnHome,
            'Return to home location?'
          )}
        >
          Return to Home
        </Button>

        <Button
          variant="critical"
          disabled={isProcessing}
          onPress={() => handleEmergencyAction(
            onEmergencyStop,
            'EMERGENCY STOP - All motors will stop immediately. This may cause the drone to fall. Continue?'
          )}
        >
          EMERGENCY STOP
        </Button>
      </View>
    </View>
  );
};
