import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TelemetryData, FlightMode, BatteryHealthStatus } from '../../../src/types/telemetry';

interface TelemetryPanelProps {
  telemetryData?: TelemetryData;
  armed?: boolean;
  mode?: FlightMode;
  onModeChange?: (mode: FlightMode) => void;
}

const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  telemetryData,
  armed = false,
  mode = FlightMode.MANUAL,
}) => {
  const formatValue = (value: number | undefined, precision: number = 1): string => {
    return value?.toFixed(precision) ?? '0';
  };

  const TelemetryRow = ({ label, value, unit }: { label: string; value: string | number; unit?: string }) => (
    <View style={styles.telemetryRow}>
      <Text style={styles.telemetryLabel}>{label}</Text>
      <Text style={styles.telemetryValue}>
        {value}{unit ? ` ${unit}` : ''}
      </Text>
    </View>
  );

  // Safe access to nested properties
  const battery = telemetryData?.sensorData.battery ?? {
    percentage: 0,
    voltage: 0,
    current: 0,
    temperature: 0,
    timeRemaining: 0,
    status: BatteryHealthStatus.UNKNOWN
  };

  const attitude = telemetryData?.attitude ?? {
    roll: 0,
    pitch: 0,
    yaw: 0,
    quaternion: [0, 0, 0, 0]
  };

  const location = telemetryData?.locationData ?? {
    fix: false,
    satellites: 0,
    accuracy: 0,
    altitude: 0,
    groundSpeed: 0,
    verticalSpeed: 0,
    distanceToHome: 0
  };

  const dataLinkStatus = telemetryData?.systemStatus.dataLinkStatus ?? {
    connected: false,
    signalStrength: 0,
    latency: 0,
    packetLoss: 0
  };

  const sensors = telemetryData?.sensorData ?? {
    imu: {
      accelerometer: { x: 0, y: 0, z: 0 },
      gyroscope: { x: 0, y: 0, z: 0 },
      magnetometer: { x: 0, y: 0, z: 0 },
      temperature: 0
    },
    barometer: {
      pressure: 0,
      temperature: 0,
      altitude: 0
    }
  };

  return (
    <View style={styles.telemetryPanel}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, armed ? styles.statusArmed : styles.statusDisarmed]}>
            <Text style={styles.statusText}>{armed ? 'ARMED' : 'DISARMED'}</Text>
          </View>
          <View style={styles.modeContainer}>
            <Text style={styles.modeText}>Mode: {mode}</Text>
          </View>
          <View style={[
            styles.batteryBadge,
            getBatteryStatusStyle(battery.status)
          ]}>
            <Text style={styles.batteryText}>{battery.percentage}%</Text>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Flight Data</Text>
          <TelemetryRow 
            label="Ground Speed" 
            value={formatValue(location.groundSpeed)} 
            unit="m/s" 
          />
          <TelemetryRow 
            label="Vertical Speed" 
            value={formatValue(location.verticalSpeed)} 
            unit="m/s" 
          />
          <TelemetryRow 
            label="Distance to Home" 
            value={formatValue(location.distanceToHome)} 
            unit="m" 
          />
          <TelemetryRow 
            label="Altitude" 
            value={formatValue(location.altitude)} 
            unit="m" 
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Attitude</Text>
          <TelemetryRow 
            label="Roll" 
            value={formatValue(attitude.roll)} 
            unit="°" 
          />
          <TelemetryRow 
            label="Pitch" 
            value={formatValue(attitude.pitch)} 
            unit="°" 
          />
          <TelemetryRow 
            label="Yaw" 
            value={formatValue(attitude.yaw)} 
            unit="°" 
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Battery</Text>
          <TelemetryRow 
            label="Voltage" 
            value={formatValue(battery.voltage, 2)} 
            unit="V" 
          />
          <TelemetryRow 
            label="Current" 
            value={formatValue(battery.current, 2)} 
            unit="A" 
          />
          <TelemetryRow 
            label="Temperature" 
            value={formatValue(battery.temperature, 1)} 
            unit="°C" 
          />
          <TelemetryRow 
            label="Time Remaining" 
            value={Math.floor((battery.timeRemaining ?? 0) / 60)} 
            unit="min" 
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>GPS</Text>
          <TelemetryRow 
            label="Satellites" 
            value={location.satellites} 
          />
          <TelemetryRow 
            label="Fix" 
            value={location.fix ? 'YES' : 'NO'} 
          />
          <TelemetryRow 
            label="Accuracy" 
            value={formatValue(location.accuracy, 1)} 
            unit="m" 
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Signal</Text>
          <TelemetryRow 
            label="RC Signal" 
            value={formatValue(telemetryData?.systemStatus.rcSignalStrength)} 
            unit="%" 
          />
          <TelemetryRow 
            label="Link Quality" 
            value={formatValue(dataLinkStatus.signalStrength)} 
            unit="%" 
          />
          <TelemetryRow 
            label="Latency" 
            value={formatValue(dataLinkStatus.latency)} 
            unit="ms" 
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Sensors</Text>
          <TelemetryRow 
            label="Accelerometer X" 
            value={formatValue(sensors.imu.accelerometer.x)} 
            unit="g" 
          />
          <TelemetryRow 
            label="Accelerometer Y" 
            value={formatValue(sensors.imu.accelerometer.y)} 
            unit="g" 
          />
          <TelemetryRow 
            label="Accelerometer Z" 
            value={formatValue(sensors.imu.accelerometer.z)} 
            unit="g" 
          />
          <TelemetryRow 
            label="Barometric Pressure" 
            value={formatValue(sensors.barometer.pressure)} 
            unit="hPa" 
          />
        </View>
      </ScrollView>
    </View>
  );
};

const getBatteryStatusStyle = (status: BatteryHealthStatus) => {
  switch (status) {
    case BatteryHealthStatus.CRITICAL:
      return styles.batteryStatusCritical;
    case BatteryHealthStatus.WARNING:
      return styles.batteryStatusWarning;
    case BatteryHealthStatus.GOOD:
      return styles.batteryStatusGood;
    default:
      return styles.batteryStatusUnknown;
  }
};

const styles = StyleSheet.create({
  telemetryPanel: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusArmed: {
    backgroundColor: '#ff4444',
  },
  statusDisarmed: {
    backgroundColor: '#44bb44',
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modeContainer: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modeText: {
    color: '#ffffff',
    fontSize: 14,
  },
  batteryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  batteryStatusGood: {
    backgroundColor: '#44bb44',
  },
  batteryStatusWarning: {
    backgroundColor: '#ffbb33',
  },
  batteryStatusCritical: {
    backgroundColor: '#ff4444',
  },
  batteryStatusUnknown: {
    backgroundColor: '#666666',
  },
  batteryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  telemetryLabel: {
    color: '#ffffff',
    fontSize: 14,
  },
  telemetryValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TelemetryPanel;