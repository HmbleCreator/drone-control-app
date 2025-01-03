// app/_layout.tsx
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ComponentProps } from 'react';

// Type for Feather icon names
type FeatherIconName = ComponentProps<typeof Feather>['name'];

export default function AppLayout() {
  const getTabIcon = (routeName: string): FeatherIconName => {
    switch (routeName) {
      case 'index':
        return 'home';
      case 'mission':
        return 'map';
      case 'telemetry':
        return 'activity';
      case 'logs':
        return 'list';
      default:
        return 'circle';
    }
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const routeName = route.name.replace('/', '');
          return <Feather name={getTabIcon(routeName)} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Control',
        }}
      />
      <Tabs.Screen
        name="mission"
        options={{
          title: 'Mission',
        }}
      />
      <Tabs.Screen
        name="telemetry"
        options={{
          title: 'Telemetry',
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
        }}
      />
    </Tabs>
  );
}
