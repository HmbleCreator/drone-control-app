import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TelemetryData } from '@/src/types/telemetry';

interface TelemetryMetric {
  key: string;
  label: string;
  unit: string;
  color: string;
  path: string[];
}

interface GraphViewProps {
  data: TelemetryData[];
  timeRange: 'realtime' | '1h' | '24h' | '7d';
  selectedMetrics: TelemetryMetric[];
  onTimeRangeChange: (range: 'realtime' | '1h' | '24h' | '7d') => void;
  loading?: boolean;
  error?: Error | null;
}

const TIME_RANGES = [
  { key: 'realtime', label: 'Real-time' },
  { key: '1h', label: '1 Hour' },
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
] as const;

const GraphView: React.FC<GraphViewProps> = ({
  data,
  timeRange,
  selectedMetrics,
  onTimeRangeChange,
  loading = false,
  error = null,
}) => {
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 32);

  const getTimeWindow = useCallback(() => {
    const date = new Date();
    return `Last ${timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '1 hour'} (${date.toLocaleDateString()})`;
  }, [timeRange]);

  const chartData = useMemo(() => {
    if (!data.length || !selectedMetrics.length) return null;

    const timestamps = data.map(d => d.timestamp);
    const labels = timestamps.map(() => '');

    const datasets = selectedMetrics.map((metric) => {
      const values = data.map(d => {
        let value: any = d;
        for (const key of metric.path) {
          value = value[key];
        }
        return typeof value === 'number' ? value : 0;
      });

      return {
        data: values,
        color: () => metric.color,
        strokeWidth: 2,
      };
    });

    return { labels, datasets };
  }, [data, selectedMetrics]);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '2',
      strokeWidth: '1',
      stroke: '#fafafa',
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  const renderMetricsList = () => (
    <View style={styles.metricsListContainer}>
      {selectedMetrics.map((metric) => (
        <View key={metric.key} style={styles.metricItem}>
          <View style={[styles.metricDot, { backgroundColor: metric.color }]} />
          <Text style={styles.metricText}>
            {metric.label} ({metric.unit})
          </Text>
        </View>
      ))}
    </View>
  );

  if (error || loading || !data.length || !selectedMetrics.length || !chartData) {
    // ... existing error/loading/empty states remain the same
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.timeRangeContainer}>
        {TIME_RANGES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.timeRangeButton,
              timeRange === key && styles.activeTimeRangeButton,
            ]}
            onPress={() => onTimeRangeChange(key)}
            disabled={loading}
          >
            <Text 
              style={[
                styles.timeRangeButtonText,
                timeRange === key && styles.activeTimeRangeButtonText,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.timeWindowText}>{getTimeWindow()}</Text>
      
      {renderMetricsList()}
      
      <View 
        style={styles.chartContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setChartWidth(width - 16);
        }}
      >
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={timeRange !== 'realtime'}
          withShadow={false}
          withVerticalLines={true}
          withHorizontalLines={true}
          yAxisInterval={5}
          segments={4}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 6,  // Reduced padding
    paddingHorizontal: 8, // Reduced padding
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeTimeRangeButton: {
    backgroundColor: '#007AFF',
  },
  timeRangeButtonText: {
    color: '#666',
    fontSize: 12,  // Reduced font size
    textAlign: 'center',
  },
  activeTimeRangeButtonText: {
    color: '#FFF',
  },
  timeWindowText: {
    fontSize: 12,  // Reduced font size
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  metricsListContainer: {
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  metricDot: {
    width: 6,   // Adjusted size
    height: 6,  // Adjusted size
    borderRadius: 3,
    marginRight: 6, // Adjusted margin
  },
  metricText: {
    fontSize: 12, // Reduced font size
    color: '#666',
  },
  chartContainer: {
    marginTop: 8,
    width: '100%',
  },
  chart: {
    borderRadius: 8,
    height: 210,  // Reduced height
  },
});

export default GraphView;