// LogViewerScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { LogStorage } from '../services/storage/LogStorage';

interface LogEntry {
  timestamp: number;
  type: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  data?: any;
}

export const LogViewerScreen: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'WARNING' | 'ERROR'>('all');

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

  const getLogCardClassName = (type: LogEntry['type']) => {
    const baseClass = 'mb-2';
    switch (type) {
      case 'ERROR':
        return `${baseClass} border-l-4 border-l-red-500`;
      case 'WARNING':
        return `${baseClass} border-l-4 border-l-yellow-500`;
      default:
        return baseClass;
    }
  };

  const renderLogEntry = ({ item }: { item: LogEntry }) => (
    <Card className={getLogCardClassName(item.type)}>
      <View className="p-3">
        <Text className="text-xs text-gray-500 mb-1">
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        <Text className="text-sm text-gray-800">
          {item.message}
        </Text>
        {item.data && (
          <Text className="text-xs text-gray-600 mt-1 font-mono">
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
    filter === 'all' || log.type === filter
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row p-4 gap-2">
        <Button
          onPress={() => setFilter('all')}
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
        >
          All
        </Button>
        <Button
          onPress={() => setFilter('WARNING')}
          variant={filter === 'WARNING' ? 'warning' : 'secondary'}
          size="sm"
        >
          Warnings
        </Button>
        <Button
          onPress={() => setFilter('ERROR')}
          variant={filter === 'ERROR' ? 'danger' : 'secondary'}
          size="sm"
        >
          Errors
        </Button>
      </View>

      <FlatList<LogEntry>
        data={filteredLogs}
        renderItem={renderLogEntry}
        keyExtractor={item => `${item.timestamp}-${item.message}`}
        className="flex-1 px-4"
      />
    </SafeAreaView>
  );
};