// eventBus.ts
type EventCallback = (data: any) => void;

class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  publish(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  unsubscribe(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }
}

export const eventBus = new EventBus();