// components/LogScreen/LogFilter.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { styles } from './styles';
import { LogLevel } from '../../../src/types/logs';

interface LogFilterProps {
  onFilterChange: (filters: LogFilters) => void;
}

export interface LogFilters {
  searchText: string;
  startDate: Date | null;
  endDate: Date | null;
  logLevels: LogLevel[];
}

export const LogFilter: React.FC<LogFilterProps> = ({ onFilterChange }) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({
    searchText: '',
    startDate: null,
    endDate: null,
    logLevels: [LogLevel.ERROR, LogLevel.WARNING, LogLevel.INFO],
  });

  const handleSearchChange = (text: string) => {
    const newFilters = { ...filters, searchText: text };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateChange = (
    type: 'start' | 'end',
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    if (date) {
      const newFilters = { ...filters, [`${type}Date`]: date };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  const toggleLogLevel = (level: LogLevel) => {
    const newLogLevels = filters.logLevels.includes(level)
      ? filters.logLevels.filter(l => l !== level)
      : [...filters.logLevels, level];
    
    const newFilters = { ...filters, logLevels: newLogLevels };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select';
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.filterContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search logs..."
        value={filters.searchText}
        onChangeText={handleSearchChange}
      />
      
      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Text>From: {formatDate(filters.startDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Text>To: {formatDate(filters.endDate)}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.filterRow, { marginTop: 10 }]}>
        {[LogLevel.ERROR, LogLevel.WARNING, LogLevel.INFO].map(level => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterChip,
              { opacity: filters.logLevels.includes(level) ? 1 : 0.5 }
            ]}
            onPress={() => toggleLogLevel(level)}
          >
            <Text style={styles.filterChipText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={filters.startDate || new Date()}
          mode="date"
          onChange={(event, date) => handleDateChange('start', event, date)}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={filters.endDate || new Date()}
          mode="date"
          onChange={(event, date) => handleDateChange('end', event, date)}
        />
      )}
    </View>
  );
};

export default LogFilter;
