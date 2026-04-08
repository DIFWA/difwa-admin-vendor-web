import { io } from "socket.io-client";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.difwa.com";
// const SOCKET_URL = "http://localhost:5001";

const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5
    // Removed strict ["websocket"] transport to allow polling for Render cold starts
});

export default socket;