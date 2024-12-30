// SocketService.ts
interface SocketConfig {
    url: string;
    reconnectAttempts: number;
    reconnectInterval: number;
    pingInterval: number;
  }
  
  type MessageHandler = (data: any) => void;
  
  export class SocketService {
    private socket: WebSocket | null = null;
    private reconnectAttempts: number = 0;
    private readonly config: SocketConfig;
    private messageHandlers: Map<string, MessageHandler> = new Map();
    private pingInterval: NodeJS.Timeout | null = null;
  
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
  
    private startPingInterval(): void {
      this.pingInterval = setInterval(() => {
        this.send('ping', {});
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
        const parsed = JSON.parse(data);
        const handler = this.messageHandlers.get(parsed.type);
        if (handler) {
          handler(parsed.payload);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    }
  
    send(type: string, payload: any): void {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type, payload }));
      } else {
        throw new Error('Socket is not connected');
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