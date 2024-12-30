// LogViewerScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { LogStorage } from '../services/storage/LogStorage';

type LogEntry = {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
};

export const LogViewerScreen: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'warning' | 'error'>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const storedLogs = await LogStorage.getLogs();
      setLogs(storedLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLogEntry = ({ item }: { item: LogEntry }) => (
    <Card
      style={[
        styles.logEntry,
        item.level === 'error' && styles.errorLog,
        item.level === 'warning' && styles.warningLog,
      ]}
    >
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <Text style={styles.message}>{item.message}</Text>
      {item.details && (
        <Text style={styles.details}>
          {JSON.stringify(item.details, null, 2)}
        </Text>
      )}
    </Card>
  );

  if (loading) {
    return <Loading text="Loading logs..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filters}>
        <Button
          onPress={() => setFilter('all')}
          variant={filter === 'all' ? 'primary' : 'secondary'}
        >
          All
        </Button>
        <Button
          onPress={() => setFilter('warning')}
          variant={filter === 'warning' ? 'warning' : 'secondary'}
        >
          Warnings
        </Button>
        <Button
          onPress={() => setFilter('error')}
          variant={filter === 'error' ? 'danger' : 'secondary'}
        >
          Errors
        </Button>
      </View>

      <FlatList
        data={logs.filter(log => filter === 'all' || log.level === filter)}
        renderItem={renderLogEntry}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  logEntry: {
    padding: 12,
    marginBottom: 8,
  },
  errorLog: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  warningLog: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#1F2937',
  },
  details: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});