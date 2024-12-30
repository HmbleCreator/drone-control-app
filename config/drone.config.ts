  // config/drone.config.ts
  export const droneConfig = {
    // Flight parameters
    flight: {
      maxAltitude: 120, // meters
      maxSpeed: 15, // m/s
      maxDistance: 1000, // meters from home
      returnToHomeAltitude: 30, // meters
      defaultClimbRate: 2, // m/s
      defaultDescendRate: 1.5, // m/s
    },
    
    // Safety parameters
    safety: {
      minBatteryReturn: 30, // percentage
      criticalBattery: 15, // percentage
      maxWindSpeed: 10, // m/s
      maxTilt: 35, // degrees
      geofenceRadius: 500, // meters
      minSatellites: 8,
    },
    
    // Sensor configurations
    sensors: {
      gpsMinAccuracy: 2.0, // meters
      imuUpdateRate: 100, // Hz
      altimeterUpdateRate: 10, // Hz
      telemetryRate: 10, // Hz
    },
    
    // Communication parameters
    communication: {
      primaryChannel: 'wifi',
      backupChannel: 'bluetooth',
      videoQuality: 'high', // 'low' | 'medium' | 'high'
      videoFrameRate: 30,
      telemetryCompression: true,
    },
    
    // Emergency procedures
    emergency: {
      autoLand: true,
      returnToHome: true,
      failsafeDelay: 1000, // ms
      signalLossThreshold: 2000, // ms
    }
  };