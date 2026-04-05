import { create } from 'zustand';
import socketService from '../socket';

const DEVICE_CONFIG = {
  id: "D-1293-SB",
  model: "ESP8266 v2.1",
  mac: "1A:2B:3C:4D:5E:6F",
  signal: -45, // dBm
  lastSeen: "Just now"
};

const useTankStore = create((set, get) => ({
  tankLevel: 65,
  isPumpOn: false,
  isAutoMode: true,
  isConnecting: false,
  deviceConfig: DEVICE_CONFIG,
  logs: [
    { time: "16:34:12", msg: "Socket connected on channel hardware:data:relay", type: "system" },
    { time: "16:34:15", msg: "Ultrasonic Pulse: Data valid @ 65% level", type: "data" },
    { time: "16:34:20", msg: "Relay Standby: Ready for manual trigger", type: "data" },
    { time: "16:35:05", msg: "Network jitter detected: 140ms latency", type: "info" }
  ],

  setTankLevel: (level) => set({ tankLevel: level }),
  setPumpStatus: (status) => set({ isPumpOn: status }),
  setAutoMode: (mode) => set({ isAutoMode: mode }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 50) })),

  initSocket: () => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      set({ isConnecting: false });
      socket.emit('join-hardware-room', get().deviceConfig.id);
      get().addLog({
        time: new Date().toLocaleTimeString(),
        msg: "Hardware link established",
        type: "system"
      });
    });

    socket.on('disconnect', () => {
      set({ isConnecting: true });
      get().addLog({
        time: new Date().toLocaleTimeString(),
        msg: "Hardware link interrupted",
        type: "info"
      });
    });

    socket.on('hardware:level-update', (data) => {
      set({ tankLevel: data.level });
      get().addLog({
        time: new Date().toLocaleTimeString(),
        msg: `Ultrasonic Pulse: Data valid @ ${data.level}% level`,
        type: "data"
      });

      // Auto-control logic
      const { isAutoMode, isPumpOn } = get();
      if (isAutoMode) {
        if (data.level < 20 && !isPumpOn) {
          get().togglePump(true);
        } else if (data.level > 90 && isPumpOn) {
          get().togglePump(false);
        }
      }
    });

    socket.on('hardware:pump-status', (data) => {
      set({ isPumpOn: data.status });
      get().addLog({
        time: new Date().toLocaleTimeString(),
        msg: `Hardware: Pump ${data.status ? 'Started' : 'Stopped'}`,
        type: "data"
      });
    });
  },

  togglePump: (status) => {
    const newStatus = status !== undefined ? status : !get().isPumpOn;
    set({ isPumpOn: newStatus });
    socketService.emit('commands:toggle-pump', {
      deviceId: get().deviceConfig.id,
      status: newStatus
    });
  },

  toggleAutoMode: () => {
    const newMode = !get().isAutoMode;
    set({ isAutoMode: newMode });
  }
}));

export default useTankStore;
