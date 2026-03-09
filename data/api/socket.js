import { io } from "socket.io-client";

const SOCKET_URL = "https://shrimpbite-socket-server.onrender.com";

const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    transports: ["websocket"]
});

export default socket;