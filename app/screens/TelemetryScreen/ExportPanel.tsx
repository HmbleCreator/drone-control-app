import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
  Alert,
  Share,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ShareDialog } from '../../../src/components/ui/ShareDialog';
import { formatDate } from '../../../src/utils/dateUtils';
import { TelemetryMetric } from '../../../src/types/telemetry';

// Add type definition for Icon component
const Icon = FeatherIcon as unknown as React.ComponentType<{
  name: string;
  size: number;
  color: string;
  style?: any;
}>;

interface ExportPanelProps {
  onExport: (format: 'csv' | 'json', startDate: Date, endDate: Date) => Promise<string>;
  selectedMetrics: TelemetryMetric[];
  availableMetrics: TelemetryMetric[];
  onMetricsChange: (metrics: TelemetryMetric[]) => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MINIMIZED_HEIGHT = 60; // Decreased from 60
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.7; // Decreased from 0.7

export const ExportPanel: React.FC<ExportPanelProps> = ({
  onExport,
  selectedMetrics,
  availableMetrics,
  onMetricsChange,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [exportedFileUrl, setExportedFileUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const panY = useRef(new Animated.Value(EXPANDED_HEIGHT - MINIMIZED_HEIGHT)).current;
  const lastGestureDy = useRef(EXPANDED_HEIGHT - MINIMIZED_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dy) > 10;
      },
      onPanResponderMove: (_, gesture) => {
        const newY = lastGestureDy.current + gesture.dy;
        if (newY >= 0 && newY <= EXPANDED_HEIGHT - MINIMIZED_HEIGHT) {
          panY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        lastGestureDy.current += gesture.dy;
        
        if (lastGestureDy.current < (EXPANDED_HEIGHT - MINIMIZED_HEIGHT) / 2) {
          // Expand
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
          lastGestureDy.current = 0;
          setIsExpanded(true);
        } else {
          // Collapse
          Animated.spring(panY, {
            toValue: EXPANDED_HEIGHT - MINIMIZED_HEIGHT,
            useNativeDriver: false,
          }).start();
          lastGestureDy.current = EXPANDED_HEIGHT - MINIMIZED_HEIGHT;
          setIsExpanded(false);
        }
      },
    })
  ).current;

  const handleExport = async (format: 'csv' | 'json') => {
    if (isExporting) return;
    
    if (selectedMetrics.length === 0) {
      Alert.alert('No Metrics Selected', 'Please select at least one metric to export');
      return;
    }

    try {
      setIsExporting(true);
      const fileUrl = await onExport(format, startDate, endDate);
      setExportedFileUrl(fileUrl);
      setShowShareDialog(true);
    } catch (error) {
      Alert.alert('Export Error', error instanceof Error ? error.message : 'Failed to export telemetry data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (isSharing || !exportedFileUrl) return;

    try {
      setIsSharing(true);
      const fileName = exportedFileUrl.split('/').pop() || 'telemetry-data';
      const metricsStr = selectedMetrics.map(m => m.label).join(', ');
      const shareTitle = `Telemetry Data Export - ${formatDate(startDate)} to ${formatDate(endDate)}`;
      const shareMessage = `Telemetry data export (${metricsStr}) from ${formatDate(startDate)} to ${formatDate(endDate)}`;

      const shareOptions = {
        title: shareTitle,
        message: shareMessage,
        url: Platform.OS === 'ios' ? exportedFileUrl : `file://${exportedFileUrl}`,
        subject: shareTitle,
      };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        setShowShareDialog(false);
      }
    } catch (error) {
      Alert.alert('Share Error', error instanceof Error ? error.message : 'Failed to share telemetry data');
    } finally {
      setIsSharing(false);
    }
  };

  const togglePanel = () => {
    const toValue = isExpanded ? EXPANDED_HEIGHT - MINIMIZED_HEIGHT : 0;
    Animated.spring(panY, {
      toValue,
      useNativeDriver: false,
      tension: 65,
      friction: 10,
    }).start();
    lastGestureDy.current = toValue;
    setIsExpanded(!isExpanded);
  };

  const MetricsSelector = () => (
    <View style={styles.metricsContainer}>
      <Text style={styles.sectionTitle}>Select Metrics</Text>
      {availableMetrics.map((metric) => {
        const isSelected = selectedMetrics.some(m => m.key === metric.key);
        return (
          <TouchableOpacity
            key={metric.key}
            onPress={() => {
              const newMetrics = isSelected
                ? selectedMetrics.filter(m => m.key !== metric.key)
                : [...selectedMetrics, metric];
              onMetricsChange(newMetrics);
            }}
            style={[
              styles.metricItem,
              isSelected && styles.metricItemSelected
            ]}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.metricInfo}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricUnit}>{metric.unit}</Text>
            </View>
            <View style={[styles.colorIndicator, { backgroundColor: metric.color }]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: panY }],
          height: EXPANDED_HEIGHT,
        },
      ]}
    >
      <View {...panResponder.panHandlers} style={styles.dragHandle}>
        <TouchableOpacity onPress={togglePanel} style={styles.headerContainer}>
          <Icon 
            name="chevron-up"
            size={24} 
            color="#666"
            style={[
              styles.chevron,
              { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }
            ]}
          />
          <Text style={styles.headerText}>Export Telemetry Data</Text>
          <Text style={styles.metricsCount}>
            {selectedMetrics.length}/{availableMetrics.length}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Animated.ScrollView
        style={[
          styles.contentContainer,
          {
            opacity: panY.interpolate({
              inputRange: [0, EXPANDED_HEIGHT - MINIMIZED_HEIGHT],
              outputRange: [1, 0],
            }),
          },
        ]}
        contentContainerStyle={styles.scrollContent}
      >
        <MetricsSelector />
      
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Time Range</Text>
          <TouchableOpacity 
            onPress={() => setShowStartPicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>From: {formatDate(startDate)}</Text>
          </TouchableOpacity>
      
          <TouchableOpacity 
            onPress={() => setShowEndPicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>To: {formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>
      
        <View style={styles.exportButtons}>
          <TouchableOpacity 
            onPress={() => handleExport('csv')}
            style={[styles.exportButton, styles.csvButton]}
            disabled={isExporting}
          >
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Text>
          </TouchableOpacity>
      
          <TouchableOpacity 
            onPress={() => handleExport('json')}
            style={[styles.exportButton, styles.jsonButton]}
            disabled={isExporting}
          >
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export JSON'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
      
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(_event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
          maximumDate={new Date()}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          onChange={(_event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
          maximumDate={new Date()}
          minimumDate={startDate}
        />
      )}

      <ShareDialog
        visible={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onShare={handleShare}
        fileName={exportedFileUrl.split('/').pop() || 'telemetry-data'}
        isSharing={isSharing}
      />
      </Animated.View>

  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  dragHandle: {
    height: MINIMIZED_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: MINIMIZED_HEIGHT,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  metricsCount: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  metricsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  metricItemSelected: {
    backgroundColor: '#e6f3ff',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  dateButtonText: {
    fontSize: 14,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  csvButton: {
    backgroundColor: '#007AFF',
  },
  jsonButton: {
    backgroundColor: '#007AFF',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ExportPanel;