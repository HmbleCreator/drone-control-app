// ApiService.ts
interface ApiConfig {
    baseUrl: string;
    timeout: number;
    headers?: Record<string, string>;
  }
  
  interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    data?: any;
    headers?: Record<string, string>;
  }
  
  export class ApiService {
    private config: ApiConfig;
  
    constructor(config: ApiConfig) {
      this.config = config;
    }
  
    private async request<T>(config: RequestConfig): Promise<T> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeout);
  
      try {
        const response = await fetch(`${this.config.baseUrl}${config.path}`, {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
            ...this.config.headers,
            ...config.headers,
          },
          body: config.data ? JSON.stringify(config.data) : undefined,
          signal: controller.signal,
        });
  
        clearTimeout(timeout);
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    }
  
    async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
      return this.request<T>({ method: 'GET', path, headers });
    }
  
    async post<T>(path: string, data: any, headers?: Record<string, string>): Promise<T> {
      return this.request<T>({ method: 'POST', path, data, headers });
    }
  
    async put<T>(path: string, data: any, headers?: Record<string, string>): Promise<T> {
      return this.request<T>({ method: 'PUT', path, data, headers });
    }
  
    async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
      return this.request<T>({ method: 'DELETE', path, headers });
    }
  }