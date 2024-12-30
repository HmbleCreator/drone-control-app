// src/core/communication/ProtocolHandler.ts

interface TelemetryData {
    altitude: number;
    latitude: number;
    longitude: number;
    speed: number;
    batteryLevel: number;
}

interface Command {
    type: string; // e.g., "takeoff", "land", "navigate"
    params?: Record<string, any>; // Additional parameters for the command
}

class ProtocolHandler {
    
    public formatTelemetry(data: TelemetryData): string {
        // Convert telemetry data to a specific format (e.g., JSON)
        const formattedData = {
            timestamp: new Date().toISOString(),
            telemetry: data,
        };
        return JSON.stringify(formattedData);
    }

    public parseCommand(command: string): Command | null {
        try {
            const parsedCommand = JSON.parse(command);
            
            // Validate command structure
            if (typeof parsedCommand.type !== 'string') {
                console.error("Invalid command type");
                return null;
            }
            
            return parsedCommand as Command; // Cast to Command type
        } catch (error) {
            console.error("Error parsing command:", error);
            return null; // Return null if parsing fails
        }
    }
}

export default ProtocolHandler;