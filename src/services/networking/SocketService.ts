// SocketService.ts
interface SocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number;
  pingInterval: number;
  droneId?: string;
}

type MessageHandler = (data: any) => void;

// Define specific message types for drone communication
interface DroneMessage {
  type: string;
  payload: any;
  timestamp: number;
  droneId: string;
  sequence: number;
}

export class SocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private readonly config: SocketConfig;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private messageQueue: DroneMessage[] = [];
  private sequenceNumber: number = 0;

  constructor(config: SocketConfig) {
    this.config = config;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.config.url);

        this.socket.onopen = () => {
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.flushMessageQueue();
          this.authenticateDrone();
          resolve();
        };

        this.socket.onclose = () => {
          this.handleDisconnect();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private authenticateDrone(): void {
    if (this.config.droneId) {
      this.send('auth', { droneId: this.config.droneId });
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.send('ping', { timestamp: Date.now() });
    }, this.config.pingInterval);
  }

  private handleDisconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    if (this.reconnectAttempts < this.config.reconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.config.reconnectInterval);
    }
  }

  private handleMessage(data: string): void {
    try {
      const message: DroneMessage = JSON.parse(data);
      
      // Handle system messages
      if (message.type === 'pong') return;
      if (message.type === 'auth_response') {
        console.log('Authentication status:', message.payload.status);
        return;
      }

      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message.payload);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) this.send(message.type, message.payload);
    }
  }

  send(type: string, payload: any): void {
    const message: DroneMessage = {
      type,
      payload,
      timestamp: Date.now(),
      droneId: this.config.droneId || 'unknown',
      sequence: this.sequenceNumber++
    };

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Queue message if socket is not ready
      this.messageQueue.push(message);
    }
  }

  registerHandler(type: string, handler: MessageHandler): void {
    this.messageHandlers.set(type, handler);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}