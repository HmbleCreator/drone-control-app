import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card } from '../common/Card';

interface TelemetryGaugeProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export const TelemetryGauge: React.FC<TelemetryGaugeProps> = ({
  label,
  value,
  unit,
  min,
  max,
  warningThreshold,
  criticalThreshold
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const getStatusColor = () => {
    if (criticalThreshold && value >= criticalThreshold) return { backgroundColor: '#EF4444' };
    if (warningThreshold && value >= warningThreshold) return { backgroundColor: '#F59E0B' };
    return { backgroundColor: '#10B981' };
  };

  return (
    <Card 
      variant="default"
      style={styles.card} // Replacing className with style
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.gaugeContainer}>
        <Text style={styles.minValue}>{min}</Text>
        <View style={styles.gauge}>
          <View
            style={[
              styles.gaugeLevel,
              getStatusColor(),
              { width: `${Math.min(Math.max(percentage, 0), 100)}%` }
            ]}
          />
        </View>
        <Text style={styles.maxValue}>{max}</Text>
      </View>
      <Text style={styles.value}>
        {value.toFixed(1)} {unit}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gaugeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gauge: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  gaugeLevel: {
    height: '100%',
    borderRadius: 4,
  },
  minValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  maxValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
