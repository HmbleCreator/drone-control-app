// config.ts
export const CONFIG = {
    // App Configuration
    app: {
      name: 'Drone Control',
      version: '1.0.0',
      buildNumber: 1,
    },
  
    // API Configuration
    api: {
      baseUrl: 'https://api.dronecontrol.com',
      timeout: 10000, // 10 seconds
      retryAttempts: 3,
    },
  
    // Flight Parameters
    flight: {
      maxAltitude: 120, // meters
      maxDistance: 1000, // meters
      maxSpeed: 15, // m/s
      defaultAltitude: 50, // meters
      returnToHomeAltitude: 80, // meters
      emergencyLandingSpeed: 2, // m/s
      geofenceRadius: 500, // meters
    },
  
    // Mission Parameters
    mission: {
      maxWaypoints: 50,
      minWaypointDistance: 5, // meters
      maxMissionDuration: 1800, // 30 minutes in seconds
      autoReturnBatteryThreshold: 30, // percentage
    },
  
    // Safety Settings
    safety: {
      minBatteryLevel: 20, // percentage
      minSignalStrength: 30, // percentage
      maxWindSpeed: 10, // m/s
      gpsMinSatellites: 8,
      returnHomeSignalThreshold: 40, // percentage
      emergencyLandingBatteryThreshold: 15, // percentage
    },
  
    // Storage
    storage: {
      maxLogRetentionDays: 30,
      maxFlightHistorySize: 100, // number of flights
      telemetryUpdateInterval: 200, // milliseconds
    },
  
    // Debug & Development
    debug: {
      enableVerboseLogging: __DEV__,
      enablePerformanceTracking: __DEV__,
      mockLocation: false,
      mockTelemetry: false,
    },
  
    // Connection Settings
    connection: {
      reconnectAttempts: 3,
      reconnectDelay: 1000, // milliseconds
      heartbeatInterval: 1000, // milliseconds
      dataStreamRate: 10, // Hz
    },
  } as const;
  
  // Export a type for the config to ensure type safety
  export type AppConfig = typeof CONFIG;