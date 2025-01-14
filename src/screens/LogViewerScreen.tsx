import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { LogStorage } from '../services/storage/LogStorage';
import { LogEntry, LogLevel } from '../types/logs';

export const LogViewerScreen: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | LogLevel>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const endTime = Date.now();
      const startTime = endTime - (24 * 60 * 60 * 1000);
      const storedLogs = await LogStorage.getLogsBetweenDates(startTime, endTime);
      setLogs(storedLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogCardStyle = (level: LogLevel) => {
    const baseStyle = { marginBottom: 8 };
    switch (level) {
      case LogLevel.ERROR:
        return { ...baseStyle, borderLeftWidth: 4, borderLeftColor: 'red' };
      case LogLevel.WARNING:
        return { ...baseStyle, borderLeftWidth: 4, borderLeftColor: 'yellow' };
      default:
        return baseStyle;
    }
  };

  const renderLogEntry = ({ item }: { item: LogEntry }) => (
    <Card style={getLogCardStyle(item.level)}>
      <View style={styles.padding}>
        <Text style={styles.dateText}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        <Text style={styles.messageText}>
          {item.message}
        </Text>
        {item.data && (
          <Text style={styles.dataText}>
            {JSON.stringify(item.data, null, 2)}
          </Text>
        )}
      </View>
    </Card>
  );

  if (loading) {
    return <Loading text="Loading logs..." />;
  }

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.level === filter
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => setFilter('all')}
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
        >
          All
        </Button>
        <Button
          onPress={() => setFilter(LogLevel.WARNING)}
          variant={filter === LogLevel.WARNING ? 'warning' : 'secondary'}
          size="sm"
        >
          Warnings
        </Button>
        <Button
          onPress={() => setFilter(LogLevel.ERROR)}
          variant={filter === LogLevel.ERROR ? 'danger' : 'secondary'}
          size="sm"
        >
          Errors
        </Button>
      </View>

      <FlatList<LogEntry>
        data={filteredLogs}
        renderItem={renderLogEntry}
        keyExtractor={item => `${item.timestamp}-${item.message}`}
        style={styles.flatList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  padding: {
    padding: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  dataText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});

export default LogViewerScreen;
