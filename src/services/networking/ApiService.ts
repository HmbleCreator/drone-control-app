// ApiService.ts
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  data?: any;
  headers?: Record<string, string>;
  priority?: 'high' | 'normal' | 'low';
}

// Define specific response types for drone operations
interface DroneCommandResponse {
  success: boolean;
  timestamp: number;
  commandId: string;
  status: 'accepted' | 'rejected' | 'completed';
  message?: string;
}

export class ApiService {
  private config: ApiConfig;
  private pendingRequests: Map<string, AbortController> = new Map();

  constructor(config: ApiConfig) {
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    let attempt = 0;
    
    while (attempt < (this.config.retryAttempts || 1)) {
      const controller = new AbortController();
      const requestId = `${config.method}-${config.path}-${Date.now()}`;
      this.pendingRequests.set(requestId, controller);
      
      const timeout = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const response = await fetch(`${this.config.baseUrl}${config.path}`, {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Priority': config.priority || 'normal',
            'X-Drone-ID': 'drone-001', // Should come from configuration
            ...this.config.headers,
            ...config.headers,
          },
          body: config.data ? JSON.stringify(config.data) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        this.pendingRequests.delete(requestId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        attempt++;
        if (attempt === this.config.retryAttempts) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      }
    }

    throw new Error('Maximum retry attempts reached');
  }

  async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'GET', path, headers });
  }

  async post<T>(path: string, data: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'POST', path, data, headers, priority: 'high' });
  }

  async put<T>(path: string, data: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PUT', path, data, headers });
  }

  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, headers });
  }

  // Drone-specific methods
  async sendCommand(command: string, parameters: any): Promise<DroneCommandResponse> {
    return this.post<DroneCommandResponse>('/drone/command', {
      command,
      parameters,
      timestamp: Date.now()
    });
  }

  cancelPendingRequests(): void {
    this.pendingRequests.forEach(controller => controller.abort());
    this.pendingRequests.clear();
  }
}
