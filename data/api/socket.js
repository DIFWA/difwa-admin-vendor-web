import { io } from "socket.io-client";

// const SOCKET_URL = "https://difwa-socket-server.onrender.com";
const SOCKET_URL = "https://nontragic-rodney-allogenically.ngrok-free.dev";
// const SOCKET_URL = "http://localhost:5001";

const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5
    // Removed strict ["websocket"] transport to allow polling for Render cold starts
});

export default socket;