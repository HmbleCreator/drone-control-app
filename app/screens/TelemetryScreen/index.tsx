import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GraphView from './GraphView';
import ExportPanel from './ExportPanel';
import TelemetryDataPanel from './TelemetryDataPanel';
import { styles } from './styles';
import { useTelemetry } from '../../../src/hooks/useTelemetry';
import type { TelemetryData, TelemetryMetric } from '../../../src/types/telemetry';

type TimeRange = 'realtime' | '1h' | '24h' | '7d';
type ExportFormat = 'csv' | 'json';

const DEFAULT_METRICS: TelemetryMetric[] = [
  { 
    key: 'altitude',
    label: 'Altitude',
    color: '#FF6B6B',
    path: ['locationData', 'altitude'],
    unit: 'meters',
    description: 'Current altitude above sea level'
  },
  { 
    key: 'speed',
    label: 'Speed',
    color: '#4ECDC4',
    path: ['locationData', 'groundSpeed'],
    unit: 'm/s',
    description: 'Current ground speed'
  },
  { 
    key: 'battery',
    label: 'Battery',
    color: '#45B7D1',
    path: ['sensorData', 'battery', 'percentage'],
    unit: '%',
    description: 'Battery charge level'
  },
];

const MAX_DATA_POINTS = 100;

const TelemetryScreen: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('realtime');
  const [selectedMetrics, setSelectedMetrics] = useState<TelemetryMetric[]>(DEFAULT_METRICS);
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const telemetry = useTelemetry();
  const mounted = useRef(true);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const dataBufferRef = useRef<TelemetryData[]>([]);

  useEffect(() => {
    return () => {
      mounted.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const loadTelemetryData = useCallback(async () => {
    if (!mounted.current || timeRange === 'realtime') return;

    try {
      const data = await telemetry.getData(timeRange);
      if (mounted.current) {
        setTelemetryData(data);
        dataBufferRef.current = data;
      }
    } catch (error) {
      if (mounted.current) {
        Alert.alert('Error', 'Failed to load telemetry data');
      }
    }
  }, [timeRange, telemetry]);

  const handleRealtimeUpdate = useCallback((data: TelemetryData) => {
    if (!mounted.current) return;

    dataBufferRef.current = [...dataBufferRef.current, data].slice(-MAX_DATA_POINTS);
    setTelemetryData([...dataBufferRef.current]);
  }, []);

  useEffect(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (timeRange === 'realtime') {
      const subscription = telemetry.subscribe(handleRealtimeUpdate);
      subscriptionRef.current = subscription;
    } else {
      loadTelemetryData();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [timeRange, handleRealtimeUpdate, loadTelemetryData]);

  const handleExport = useCallback(async (
    format: ExportFormat,
    startDate: Date,
    endDate: Date
  ): Promise<string> => {
    try {
      const fileUrl = await telemetry.exportData(format, startDate, endDate);
      if (mounted.current) {
        console.log('File exported:', fileUrl);
        Alert.alert('Success', 'Data exported successfully');
      }
      return fileUrl;
    } catch (error) {
      if (mounted.current) {
        Alert.alert('Error', 'Failed to export telemetry data');
      }
      throw error;
    }
  }, [telemetry]);

  const handleTimeRangeChange = useCallback((newRange: TimeRange) => {
    setTimeRange(newRange);
    dataBufferRef.current = [];
  }, []);

  const handleMetricsChange = useCallback((metrics: TelemetryMetric[]) => {
    setSelectedMetrics(metrics);
  }, []);

  if (telemetry.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Error loading telemetry: {telemetry.error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (telemetry.isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Initializing telemetry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TelemetryDataPanel data={telemetryData} />
      <GraphView
        data={telemetryData}
        selectedMetrics={selectedMetrics}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />
      <ExportPanel
        onExport={handleExport}
        selectedMetrics={selectedMetrics}
        availableMetrics={DEFAULT_METRICS}
        onMetricsChange={handleMetricsChange}
      />
    </SafeAreaView>
  );
};

export default TelemetryScreen;