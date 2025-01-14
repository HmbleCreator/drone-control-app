import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Wifi, Battery } from 'lucide-react-native';
import { styles, colors } from './styles';

export interface ConnectionPanelProps {
  deviceId: string;
  onConnect: (deviceId: string) => Promise<void>;
  onDisconnect: () => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  batteryLevel: number;
  signalStrength: number;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  deviceId,
  onConnect,
  onDisconnect,
  connectionStatus,
  batteryLevel,
  signalStrength,
}) => {
  const [inputDeviceId, setInputDeviceId] = useState(deviceId);

  const handleConnect = () => {
    if (connectionStatus === 'connected') {
      onDisconnect();
    } else {
      onConnect(inputDeviceId);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return colors.success;
      case 'connecting':
        return colors.warning;
      default:
        return colors.danger;
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Connection Status</Text>
      
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <View style={styles.column}>
          <TextInput
            style={styles.textInput}
            value={inputDeviceId}
            onChangeText={setInputDeviceId}
            placeholder="Enter Device ID"
            editable={connectionStatus !== 'connected'}
          />
          
          <View style={styles.row}>
            <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.value}>
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: connectionStatus === 'connected' ? colors.danger : colors.primary,
              alignSelf: 'flex-start', // Ensure button aligns at the top
            }
          ]}
          onPress={handleConnect}
        >
          <Text style={styles.buttonText}>
            {connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.row, { marginTop: 12 }]}>
        <View style={styles.row}>
          <Battery 
            color={batteryLevel > 20 ? colors.success : colors.danger}
            size={24}
          />
          <Text style={styles.value}>{batteryLevel}%</Text>
        </View>
        
        <View style={styles.row}>
          <Wifi 
            color={signalStrength > 50 ? colors.success : colors.warning}
            size={24}
          />
          <Text style={styles.value}>{signalStrength}%</Text>
        </View>
      </View>
    </View>
  );
};

export default ConnectionPanel;