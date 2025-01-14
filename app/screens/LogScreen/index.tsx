// components/LogScreen/LogScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Alert, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogFilter, LogFilters } from './LogFilter';
import { LogList } from './LogList';
import { styles } from './styles';
import { LogEntry, LogLevel } from '../../../src/types/logs'; // LogLevel is imported here
import { useLogManager } from '../../../src/hooks/useLogManager';

interface LogScreenProps {
  onLogSelect?: (log: LogEntry) => void;
}

const LogScreen: React.FC<LogScreenProps> = ({ onLogSelect }) => {
  const { getLogs, exportLogs, clearLogs } = useLogManager();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const fetchedLogs = await getLogs();
      setLogs(fetchedLogs);
      setFilteredLogs(fetchedLogs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load logs');
    }
  }, [getLogs]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const handleFilterChange = (filters: LogFilters) => {
    const filtered = logs.filter(log => {
      const matchesSearch = !filters.searchText ||
        log.message.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        (log.details?.toLowerCase().includes(filters.searchText.toLowerCase()) ?? false);

      const matchesLevel = filters.logLevels.includes(log.level as LogLevel); // Explicit use of LogLevel here

      const matchesDateRange = (!filters.startDate || new Date(log.timestamp) >= filters.startDate) &&
        (!filters.endDate || new Date(log.timestamp) <= filters.endDate);

      return matchesSearch && matchesLevel && matchesDateRange;
    });

    setFilteredLogs(filtered);
  };

  const handleLogPress = (log: LogEntry) => {
    if (onLogSelect) {
      onLogSelect(log);
    }
  };

  const handleExportLogs = () => {
    exportLogs();
    Alert.alert('Logs exported');
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to clear all logs?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await clearLogs();
            setFilteredLogs([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button title="Export Logs" onPress={handleExportLogs} />
        <Button title="Clear Logs" onPress={handleClearLogs} />
      </View>
      <LogFilter onFilterChange={handleFilterChange} />
      <LogList
        logs={filteredLogs}
        onLogPress={handleLogPress}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

export default LogScreen;
