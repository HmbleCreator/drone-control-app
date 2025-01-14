import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { styles } from './styles';
import { TelemetryData } from '../../../src/types/telemetry';

interface TelemetryDataPanelProps {
  data: TelemetryData[];
  loading?: boolean;
  error?: Error | null;
}

const formatValue = (value: number, unit: string, precision: number = 2): string => {
  return `${value.toFixed(precision)} ${unit}`;
};

const TelemetryDataPanel: React.FC<TelemetryDataPanelProps> = ({ 
  data,
  loading = false,
  error = null
}) => {
  if (loading) {
    return (
      <View style={styles.dataPanel}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.noDataText, { marginTop: 8 }]}>Loading telemetry data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.dataPanel}>
        <Text style={[styles.noDataText, { color: '#FF3B30' }]}>
          Error: {error.message}
        </Text>
      </View>
    );
  }

  const latestData = data[data.length - 1];

  if (!latestData) {
    return (
      <View style={styles.dataPanel}>
        <Text style={styles.noDataText}>No telemetry data available</Text>
      </View>
    );
  }

  const { sensorData, locationData, systemStatus } = latestData;

  const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}:</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.dataPanel}>
      <DataRow 
        label="Altitude"
        value={formatValue(locationData.altitude, 'm')}
      />
      <DataRow 
        label="Ground Speed"
        value={formatValue(locationData.groundSpeed, 'm/s')}
      />
      <DataRow 
        label="Battery"
        value={`${sensorData.battery.percentage.toFixed(1)}%`}
      />
      <DataRow 
        label="GPS"
        value={`${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`}
      />
      <DataRow 
        label="Signal Strength"
        value={`${systemStatus.dataLinkStatus.signalStrength}%`}
      />
    </View>
  );
};

export default TelemetryDataPanel;