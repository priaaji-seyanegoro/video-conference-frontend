import { Socket } from "socket.io-client";
import io from "socket.io-client";

class SocketManager {
  private socket: typeof Socket | null = null;
  private serverUrl: string;

  constructor() {
    this.serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5001";
  }

  connect(): typeof Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ["websocket"],
        upgrade: true,
      });
    }
    if (!this.socket) {
      throw new Error("Socket connection failed");
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): typeof Socket | null {
    return this.socket;
  }

  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketManager = new SocketManager();
export default socketManager;
