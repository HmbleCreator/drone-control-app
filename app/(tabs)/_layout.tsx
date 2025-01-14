import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ConnectionPanel from '../screens/FlightScreen/ConnectionPanel'; // Ensure the path is correct for your project

export default function TabLayout() {
  const handleConnect = async (deviceId: string) => {
    // Implement your connection logic here
  };

  const handleDisconnect = async () => {
    // Implement your disconnection logic here
  };

  const deviceId = 'example-device-id'; // Replace with actual device id
  const connectionStatus = 'disconnected'; // Replace with actual connection status
  const batteryLevel = 100; // Replace with actual battery level
  const signalStrength = 0; // Replace with actual signal strength

  return (
    <Tabs screenOptions={{
      headerShown: true,
    }}>
      <Tabs.Screen
        name="flight"
        options={{
          header: () => (
            <View style={styles.header}>
              <ConnectionPanel
                deviceId={deviceId}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                connectionStatus={connectionStatus}
                batteryLevel={batteryLevel}
                signalStrength={signalStrength}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mission"
        options={{
          title: 'Mission',
        }}
      />
      <Tabs.Screen
        name="telemetry"
        options={{
          title: 'Telemetry',
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#000',
  },
});
