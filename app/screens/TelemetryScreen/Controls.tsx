import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { styles } from './styles';

interface ControlsProps {
  onReturnHome?: () => Promise<void>;
  onHover?: () => Promise<void>;
  onEmergencyStop?: () => Promise<void>;
  disabled?: boolean;
}

type ActionFunction = (() => Promise<void>) | undefined;

const Controls: React.FC<ControlsProps> = ({
  onReturnHome,
  onHover,
  onEmergencyStop,
  disabled = false
}) => {
  const [loading, setLoading] = useState<string>('');

  const handleAction = async (
    action: ActionFunction,
    actionName: string
  ) => {
    if (!action) {
      Alert.alert('Not Implemented', `${actionName} functionality is not available`);
      return;
    }

    try {
      setLoading(actionName);
      await action();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : `Failed to execute ${actionName}`
      );
    } finally {
      setLoading('');
    }
  };

  return (
    <View style={[styles.controls, { opacity: disabled ? 0.5 : 1 }]}>
      <TouchableOpacity 
        style={[styles.controlButton, { backgroundColor: '#007AFF' }]}
        onPress={() => handleAction(onReturnHome, 'Return to Home')}
        disabled={disabled || loading !== ''}
      >
        {loading === 'Return to Home' ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.controlButtonText}>Return to Home</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.controlButton, { backgroundColor: '#34C759' }]}
        onPress={() => handleAction(onHover, 'Hover')}
        disabled={disabled || loading !== ''}
      >
        {loading === 'Hover' ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.controlButtonText}>Hover</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.controlButton, { backgroundColor: '#FF3B30' }]}
        onPress={() => handleAction(onEmergencyStop, 'Emergency Stop')}
        disabled={disabled || loading !== ''}
      >
        {loading === 'Emergency Stop' ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.controlButtonText}>Emergency Stop</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Controls;