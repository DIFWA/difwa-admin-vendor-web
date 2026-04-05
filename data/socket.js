import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
        }
        return this.socket;
    }

    getSocket() {
        if (!this.socket) {
            return this.connect();
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

const socketService = new SocketService();
export default socketService;
