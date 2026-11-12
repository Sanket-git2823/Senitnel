/**
 * SENTINEL Enterprise API Client
 * Manages REST requests and WebSocket real-time telemetry subscriptions.
 * Seamlessly connects to FastAPI intelligence engine with automatic mock fallback.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

export interface WsMessage<T = unknown> {
  event: string;
  data: T;
  timestamp: string;
}

export type WsSubscriptionCallback<T = unknown> = (data: T) => void;
export type WsState = 'connected' | 'connecting' | 'disconnected';

class ApiClient {
  private baseUrl: string;
  private wsUrl: string;
  private useMock: boolean;
  private socket: WebSocket | null = null;
  private wsState: WsState = 'disconnected';
  private pingInterval: any = null;
  private reconnectTimer: any = null;
  private subscriptions: Map<string, Set<WsSubscriptionCallback<any>>> = new Map();
  private stateListeners: Set<(state: WsState) => void> = new Set();

  constructor() {
    // In dev with Vite proxy, use relative '/api/v1', or fallback to localhost:8000
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

    // WebSocket URL defaults to local FastAPI live broadcast
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const port = typeof window !== 'undefined' && window.location.port === '5173' ? '8000' : '8000';
    this.wsUrl = import.meta.env.VITE_WS_BASE_URL || `ws://${host}:${port}/ws/live`;

    // Default to false (connect to real backend), but falls back gracefully if backend is down
    this.useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

    // Auto-connect WebSocket in browser environment
    if (typeof window !== 'undefined') {
      this.initWebSocket();
    }
  }

  public isMockMode(): boolean {
    return this.useMock;
  }

  public setMockMode(enabled: boolean) {
    this.useMock = enabled;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getWsUrl(): string {
    return this.wsUrl;
  }

  public getWsState(): WsState {
    return this.wsState;
  }

  public onWsStateChange(callback: (state: WsState) => void): () => void {
    this.stateListeners.add(callback);
    callback(this.wsState);
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  private setWsState(state: WsState) {
    this.wsState = state;
    this.stateListeners.forEach((cb) => cb(state));
  }

  /**
   * Initializes real WebSocket connection to Sentinel telemetry engine
   */
  public initWebSocket() {
    if (typeof window === 'undefined') return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.setWsState('connecting');
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        this.setWsState('connected');
        console.log(`[SENTINEL WS] Connected to live telemetry stream: ${this.wsUrl}`);

        // Keep connection open with heartbeat ping every 15s
        clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send('ping');
          }
        }, 15000);
      };

      this.socket.onmessage = (event) => {
        if (event.data === 'pong') return;

        try {
          const parsed = JSON.parse(event.data);
          const eventType = parsed.event || 'message';
          const payload = parsed.data !== undefined ? parsed.data : parsed;

          // Dispatch to event-specific listeners
          this.emitStreamMessage(eventType, payload);
          // Dispatch to global wildcard listeners
          this.emitStreamMessage('*', { event: eventType, data: payload, timestamp: parsed.timestamp });
        } catch {
          // Ignore non-JSON or raw text
        }
      };

      this.socket.onerror = () => {
        // Log quietly — server may not be started yet
      };

      this.socket.onclose = () => {
        this.setWsState('disconnected');
        clearInterval(this.pingInterval);

        // Auto-reconnect with 3s backoff
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.initWebSocket();
        }, 3000);
      };
    } catch {
      this.setWsState('disconnected');
    }
  }

  /**
   * Simulated network delay for realistic enterprise UI states
   */
  public async simulateNetworkDelay(ms: number = 60): Promise<void> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  /**
   * REST GET Request
   */
  public async get<T>(endpoint: string, mockFallback?: T): Promise<ApiResponse<T>> {
    if (this.useMock && mockFallback !== undefined) {
      await this.simulateNetworkDelay();
      return {
        success: true,
        data: mockFallback,
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentinel-Client': 'Sentinel-Web-Workstation/2.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        timestamp: json.timestamp || new Date().toISOString()
      };
    } catch (err: any) {
      if (mockFallback !== undefined) {
        return {
          success: true,
          data: mockFallback,
          timestamp: new Date().toISOString()
        };
      }
      return {
        success: false,
        data: null as any,
        timestamp: new Date().toISOString(),
        error: err.message || 'Network request failed'
      };
    }
  }

  /**
   * REST POST Request
   */
  public async post<T, B = unknown>(endpoint: string, body: B, mockFallback?: T): Promise<ApiResponse<T>> {
    if (this.useMock && mockFallback !== undefined) {
      await this.simulateNetworkDelay(100);
      return {
        success: true,
        data: mockFallback,
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentinel-Client': 'Sentinel-Web-Workstation/2.0'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        timestamp: json.timestamp || new Date().toISOString()
      };
    } catch (err: any) {
      if (mockFallback !== undefined) {
        return {
          success: true,
          data: mockFallback,
          timestamp: new Date().toISOString()
        };
      }
      return {
        success: false,
        data: null as any,
        timestamp: new Date().toISOString(),
        error: err.message || 'Post operation failed'
      };
    }
  }

  /**
   * REST PATCH Request
   */
  public async patch<T, B = unknown>(endpoint: string, body: B, mockFallback?: T): Promise<ApiResponse<T>> {
    if (this.useMock && mockFallback !== undefined) {
      await this.simulateNetworkDelay(80);
      return {
        success: true,
        data: mockFallback,
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentinel-Client': 'Sentinel-Web-Workstation/2.0'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        timestamp: json.timestamp || new Date().toISOString()
      };
    } catch (err: any) {
      if (mockFallback !== undefined) {
        return {
          success: true,
          data: mockFallback,
          timestamp: new Date().toISOString()
        };
      }
      return {
        success: false,
        data: null as any,
        timestamp: new Date().toISOString(),
        error: err.message || 'Patch operation failed'
      };
    }
  }

  /**
   * Telemetry WebSocket Stream subscription
   */
  public subscribeToStream<T>(topic: string, callback: WsSubscriptionCallback<T>): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(callback);

    // Return unsubscribe cleaner
    return () => {
      const subs = this.subscriptions.get(topic);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(topic);
        }
      }
    };
  }

  /**
   * Emit simulated or received message to subscribers
   */
  public emitStreamMessage<T>(topic: string, data: T): void {
    const subs = this.subscriptions.get(topic);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[SENTINEL WS] Error in subscriber for topic '${topic}':`, e);
        }
      });
    }
  }

  /**
   * One-click demo triggers
   */
  public async triggerDemoAnomaly(): Promise<boolean> {
    const res = await this.post('/simulator/trigger-demo-anomaly', {});
    return res.success;
  }

  public async resolveDemoAnomaly(): Promise<boolean> {
    const res = await this.post('/simulator/resolve-demo-anomaly', {});
    return res.success;
  }
}

export const apiClient = new ApiClient();
