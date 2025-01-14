// src/core/communication/CommandProcessor.ts
import { DataLink } from './DataLink';
import { DroneCommand } from './TelemetryModels';

export class CommandProcessor {
    private dataLink: DataLink;
    private commandQueue: DroneCommand[] = [];

    constructor(dataLink: DataLink) {
        this.dataLink = dataLink;
    }

    public async processCommand(command: Partial<DroneCommand>): Promise<void> {
        const fullCommand = this.buildCommand(command);
        this.validateCommand(fullCommand);
        this.prioritizeCommand(fullCommand);
        await this.executeCommand(fullCommand);
    }

    private buildCommand(command: Partial<DroneCommand>): DroneCommand {
        return {
            id: crypto.randomUUID(), // Generate unique ID for each command
            type: command.type || 'HOVER', // Default to HOVER if no type specified
            timestamp: command.timestamp || Date.now(),
            payload: command.payload || {},
        };
    }

    private validateCommand(command: DroneCommand): void {
        if (!command.type || !['MOVE', 'HOVER', 'LAND', 'TAKEOFF', 'RTH', 'EMERGENCY'].includes(command.type)) {
            throw new Error('Invalid command type');
        }

        // Validate payload based on command type
        switch (command.type) {
            case 'MOVE':
                if (!command.payload?.latitude || !command.payload?.longitude) {
                    throw new Error('Move command requires latitude and longitude');
                }
                break;
            case 'TAKEOFF':
                if (command.payload?.altitude !== undefined && 
                    (command.payload.altitude < 0 || command.payload.altitude > 120)) {
                    throw new Error('Invalid takeoff altitude');
                }
                break;
            // Add other command-specific validations as needed
        }
    }

    private prioritizeCommand(command: DroneCommand): void {
        // Define priority levels for different command types
        const priorityMap: Record<DroneCommand['type'], number> = {
            'EMERGENCY': 100,
            'LAND': 90,
            'RTH': 80,
            'HOVER': 70,
            'TAKEOFF': 60,
            'MOVE': 50
        };

        // Add command with its priority to the queue
        this.commandQueue.push(command);
        this.commandQueue.sort((a, b) => (priorityMap[b.type] || 0) - (priorityMap[a.type] || 0));
    }

    private async executeCommand(command: DroneCommand): Promise<void> {
        try {
            await this.dataLink.sendCommand(command);
            // Remove executed command from queue
            const index = this.commandQueue.findIndex(cmd => cmd.id === command.id);
            if (index !== -1) {
                this.commandQueue.splice(index, 1);
            }
        } catch (error) {
            throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
