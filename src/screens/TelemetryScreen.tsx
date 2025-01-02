// TelemetryScreen.tsx
import React from 'react';
import { ScrollView, SafeAreaView, StyleSheet, View, Dimensions } from 'react-native';
import { Card } from '../components/common/Card';
import { TelemetryGauge } from '../components/flight/TelemetryGauge';
import { useTelemetry } from '../hooks/useTelemetry';
import { LineChart } from 'react-native-chart-kit';
import { Loading } from '../components/common/Loading';
import { TelemetryData } from '../types/telemetry';

interface TelemetryHistoryItem {
  timestamp: number;
  data: TelemetryData;
}

export const TelemetryScreen: React.FC = () => {
  const { telemetry, telemetryHistory, isConnected } = useTelemetry();
  const screenWidth = Dimensions.get('window').width;

  if (!telemetry) {
    return <Loading />;
  }

  const chartData = {
    labels: telemetryHistory.slice(-6).map(item => 
      new Date(item.timestamp).toLocaleTimeString([], { 
        minute: '2-digit', 
        second: '2-digit' 
      })
    ),
    datasets: [
      {
        data: telemetryHistory.slice(-6).map(item => item.data.verticalSpeed || 0),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // iOS blue
        strokeWidth: 2
      }
    ],
    legend: ['Vertical Speed']
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Card 
          variant="elevated"
          className="mb-4"
        >
          <LineChart
            data={chartData}
            width={screenWidth - 32} // Account for padding
            height={300}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#007AFF'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </Card>
        <View style={styles.gaugesGrid}>
          <TelemetryGauge
            label="Vertical Speed"
            value={telemetry.verticalSpeed}
            unit="m/s"
            min={-10}
            max={10}
            warningThreshold={8}
            criticalThreshold={9}
          />
          <TelemetryGauge
            label="Ground Speed"
            value={telemetry.groundSpeed}
            unit="m/s"
            min={0}
            max={15}
            warningThreshold={12}
            criticalThreshold={14}
          />
          <TelemetryGauge
            label="Distance to Home"
            value={telemetry.distanceToHome}
            unit="m"
            min={0}
            max={500}
            warningThreshold={400}
            criticalThreshold={450}
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
  gaugesGrid: {
    gap: 16,
  },
});