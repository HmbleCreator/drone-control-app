// TelemetryScreen.tsx
import React from 'react';
import { ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Card } from '../components/common/Card';
import { TelemetryGauge } from '../components/flight/TelemetryGauge';
import { useTelemetry } from '../hooks/useTelemetry';
import { LineChart } from 'react-native-charts-wrapper';

export const TelemetryScreen: React.FC = () => {
  const { telemetry, telemetryHistory } = useTelemetry();

  if (!telemetry) {
    return <Loading text="Loading telemetry data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Card style={styles.chartCard}>
          <LineChart
            data={telemetryHistory.altitude}
            style={styles.chart}
            chartDescription={{ text: '' }}
            legend={{ enabled: true }}
            xAxis={{ drawGridLines: false }}
            yAxis={{ left: { drawGridLines: true } }}
          />
        </Card>

        <View style={styles.gaugesGrid}>
          <TelemetryGauge
            label="Vertical Speed"
            value={telemetry.verticalSpeed}
            unit="m/s"
            min={-10}
            max={10}
          />
          <TelemetryGauge
            label="Ground Speed"
            value={telemetry.groundSpeed}
            unit="m/s"
            min={0}
            max={20}
          />
          <TelemetryGauge
            label="Distance to Home"
            value={telemetry.distanceToHome}
            unit="m"
            min={0}
            max={1000}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
  },
  chart: {
    height: 300,
  },
  gaugesGrid: {
    gap: 16,
  },
});