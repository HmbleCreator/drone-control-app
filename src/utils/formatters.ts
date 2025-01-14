// formatters.ts
export const formatTelemetry = {
    altitude: (value: number) => `${value.toFixed(1)}m`,
    speed: (value: number) => `${value.toFixed(1)}m/s`,
    battery: (value: number) => `${value.toFixed(0)}%`,
    coordinates: (lat: number, lon: number) => 
      `${lat.toFixed(6)}°, ${lon.toFixed(6)}°`,
    timestamp: (date: Date) => 
      date.toISOString().replace('T', ' ').slice(0, -5)
  };