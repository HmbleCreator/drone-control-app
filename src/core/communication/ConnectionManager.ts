// src/core/communication/ConnectionManager.ts

class ConnectionManager {
    private isConnected: boolean = false;

    public async connect(): Promise<void> {
        try {
            await this.simulateConnection(); // Simulate establishing a connection
            this.isConnected = true;
            console.log("Connected to ground station.");
        } catch (error) {
            console.error("Failed to connect to ground station:", error);
        }
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.simulateDisconnection(); // Simulate disconnection logic
            this.isConnected = false;
            console.log("Disconnected from ground station.");
        } else {
            console.log("No active connection to disconnect.");
        }
    }

    private async simulateConnection(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay for connection
    }

    private async simulateDisconnection(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay for disconnection
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

export default ConnectionManager;