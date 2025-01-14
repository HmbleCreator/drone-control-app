// src/core/communication/CommunicationManager.ts

import NetworkManager from './NetworkManager';
import ProtocolHandler from './ProtocolHandler';
import ConnectionManager from './ConnectionManager';

interface TelemetryData {
    altitude: number;
    latitude: number;
    longitude: number;
    speed: number;
    batteryLevel: number;
}

class CommunicationManager {
    private networkManager: NetworkManager;
    private protocolHandler: ProtocolHandler;
    private connectionManager: ConnectionManager;

    constructor() {
        this.networkManager = new NetworkManager();
        this.protocolHandler = new ProtocolHandler();
        this.connectionManager = new ConnectionManager();
    }

    public async initialize(): Promise<void> {
        await this.connectionManager.connect(); // Correctly call connect on ConnectionManager
        console.log("Communication Manager initialized.");
    }

    public async sendTelemetry(data: TelemetryData): Promise<void> {
        const formattedData = this.protocolHandler.formatTelemetry(data);
        await this.networkManager.sendData(formattedData);
        console.log("Telemetry data sent:", formattedData);
    }

    public async receiveCommands(): Promise<void> {
        const commandString = await this.networkManager.receiveData();
        const parsedCommand = this.protocolHandler.parseCommand(commandString);
        
        if (parsedCommand) {
            console.log("Received command:", parsedCommand);
            // Handle the command (e.g., execute it)
        }
    }
}

export default CommunicationManager;
