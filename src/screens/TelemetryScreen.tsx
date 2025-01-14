import React, { useState, useEffect } from 'react';
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
  const { telemetry } = useTelemetry(); // Removed isConnected
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryHistoryItem[]>([]);
  const screenWidth = Dimensions.get('window').width;

  // Update history when telemetry changes
  useEffect(() => {
    if (telemetry) {
      setTelemetryHistory(prev => [...prev, {
        timestamp: Date.now(),
        data: telemetry
      }].slice(-6)); // Keep last 6 readings
    }
  }, [telemetry]);

  if (!telemetry) {
    return <Loading />;
  }

  const chartData = {
    labels: telemetryHistory.map((item: TelemetryHistoryItem) =>
      new Date(item.timestamp).toLocaleTimeString([], {
        minute: '2-digit',
        second: '2-digit'
      })
    ),
    datasets: [
      {
        data: telemetryHistory.map((item: TelemetryHistoryItem) => 
          item.data.locationData.verticalSpeed || 0
        ),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Vertical Speed']
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.gaugesGrid}>
          <TelemetryGauge
            value={telemetry.locationData.groundSpeed}
            label="Ground Speed"
            unit="m/s"
            min={0}
            max={30}
            warningThreshold={20}
            criticalThreshold={25}
          />
          <TelemetryGauge
            value={telemetry.locationData.verticalSpeed}
            label="Vertical Speed"
            unit="m/s"
            min={-10}
            max={10}
            warningThreshold={8}
            criticalThreshold={9}
          />
          <TelemetryGauge
            value={telemetry.locationData.distanceToHome}
            label="Distance to Home"
            unit="m"
            min={0}
            max={1000}
            warningThreshold={800}
            criticalThreshold={900}
          />
        </View>
        
        <Card>
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
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

export default TelemetryScreen;