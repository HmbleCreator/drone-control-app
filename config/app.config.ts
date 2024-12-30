// config/app.config.ts
export const appConfig = {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    
    // API configurations
    api: {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      timeout: 5000,
      retryAttempts: 3,
    },
    
    // UI configurations
    ui: {
      theme: 'dark',
      refreshRate: 60, // Hz
      maxTelemetryHistory: 1000,
      defaultMapZoom: 15,
    },
    
    // Storage configurations
    storage: {
      maxLogSize: 50 * 1024 * 1024, // 50MB
      logRetentionDays: 30,
      telemetryBufferSize: 100,
    },
    
    // Debug configurations
    debug: {
      enabled: process.env.NODE_ENV === 'development',
      verboseLogging: false,
      showPerformanceMetrics: true,
    }
  };