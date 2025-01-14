// components/LogScreen/LogList.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import { LogEntry, LogLevel } from '../../../src/types/logs';

interface LogListProps {
  logs: LogEntry[];
  onLogPress: (log: LogEntry) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const LogList: React.FC<LogListProps> = ({
  logs,
  onLogPress,
  refreshing = false,
  onRefresh
}) => {
  const getLogLevelStyle = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return styles.logLevelError;
      case LogLevel.WARNING:
        return styles.logLevelWarning;
      case LogLevel.INFO:
        return styles.logLevelInfo;
      default:
        return {};
    }
  };

  const renderLogItem = ({ item }: { item: LogEntry }) => (
    <TouchableOpacity
      style={styles.logItem}
      onPress={() => onLogPress(item)}
    >
      <View style={styles.logHeader}>
        <Text style={styles.logTimestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        <Text style={[styles.logLevel, getLogLevelStyle(item.level)]}>
          {item.level}
        </Text>
      </View>
      <Text style={styles.logMessage} numberOfLines={2}>
        {item.message}
      </Text>
      {item.details && (
        <Text style={styles.logDetails} numberOfLines={1}>
          {item.details}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyList}>
      <Text style={styles.emptyText}>No logs found</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.logList}
      data={logs}
      renderItem={renderLogItem}
      keyExtractor={item => item.timestamp.toString()}
      ListEmptyComponent={renderEmptyList}
      refreshing={refreshing}
      onRefresh={onRefresh}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};

export default LogList;
