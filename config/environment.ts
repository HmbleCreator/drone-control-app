// config/environment.ts
type Environment = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
  apiUrl: string;
  socketUrl: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  mockSensors: boolean;
  enableTesting: boolean;
}

export const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    apiUrl: 'http://localhost:3000',
    socketUrl: 'ws://localhost:3001',
    logLevel: 'debug',
    mockSensors: true,
    enableTesting: true,
  },
  staging: {
    apiUrl: 'https://staging-api.droneapp.com',
    socketUrl: 'wss://staging-ws.droneapp.com',
    logLevel: 'info',
    mockSensors: false,
    enableTesting: true,
  },
  production: {
    apiUrl: 'https://api.droneapp.com',
    socketUrl: 'wss://ws.droneapp.com',
    logLevel: 'warn',
    mockSensors: false,
    enableTesting: false,
  },
};

export const getCurrentEnvironment = (): EnvironmentConfig => {
  const env = process.env.NODE_ENV as Environment || 'development';
  return environments[env];
};