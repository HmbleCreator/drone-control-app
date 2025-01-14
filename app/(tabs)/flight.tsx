// app/(tabs)/flight.tsx
import { FlightMode } from '@/src/types/telemetry';
import FlightScreen from '../screens/FlightScreen';

export default function FlightPage() {
  const handleEmergencyStop = () => {
    console.log("Emergency stop activated");
    // Handle emergency stop logic here
  };

  const handleModeChange = (mode: FlightMode) => {
    console.log(`Mode changed to: ${mode}`);
    // Handle mode change logic here
  };

  return (
    <FlightScreen 
      onEmergencyStop={handleEmergencyStop} 
      onModeChange={handleModeChange} 
    />
  );
}
