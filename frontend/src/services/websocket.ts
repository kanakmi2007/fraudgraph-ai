type MessageHandler = (event: any) => void;

class LiveWebSocketService {
  private socket: WebSocket | null = null;
  private listeners: MessageHandler[] = [];
  private reconnectInterval = 3000;
  private isConnecting = false;

  public connect() {
    if (this.socket || this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.socket = new WebSocket('ws://localhost:8000/ws/live');

      this.socket.onopen = () => {
        this.isConnecting = false;
        console.log('[WEBSOCKET] Connected to FraudGraph AI Live Stream');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(data));
        } catch (e) {
          console.error('[WEBSOCKET] Error parsing message', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        this.socket = null;
        console.warn('[WEBSOCKET] Closed. Reconnecting in 3s...');
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.socket.onerror = (err) => {
        this.isConnecting = false;
        console.error('[WEBSOCKET] Error', err);
      };
    } catch (e) {
      this.isConnecting = false;
      console.error('[WEBSOCKET] Failed connection', e);
    }
  }

  public subscribe(handler: MessageHandler) {
    this.listeners.push(handler);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== handler);
    };
  }

  public sendStep() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send('STEP');
    }
  }
}

export const wsService = new LiveWebSocketService();
