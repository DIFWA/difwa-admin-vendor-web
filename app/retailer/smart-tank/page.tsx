"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, RefreshCcw, Wifi, Database, Info, AlertTriangle, Play, Pause, Power, Terminal } from 'lucide-react';
import WaterTank from '@/components/retailer/smart-tank/WaterTank';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Sample Device Configuration
const DEVICE_CONFIG = {
  id: "D-1293-SB",
  model: "ESP8266 v2.1",
  mac: "1A:2B:3C:4D:5E:6F",
  signal: -45, // dBm
  lastSeen: "Just now"
};

const SmartTankPage = () => {
  const [tankLevel, setTankLevel] = useState(65);
  const [isPumpOn, setIsPumpOn] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // 1. Initialize Socket Connection
    // Replace with your actual backend URL from .env
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001', {
      headers: { "ngrok-skip-browser-warning": "true" }
    });

    socketInstance.on('connect', () => {
      toast.success('Hardware Link Established');
      setIsConnecting(false);
      // Join device-specific room
      socketInstance.emit('join-hardware-room', DEVICE_CONFIG.id);
    });

    socketInstance.on('disconnect', () => {
      toast.error('Hardware Link Interrupted');
      setIsConnecting(true);
    });

    // Listen for level updates from ESP8266
    socketInstance.on('hardware:level-update', (data: { level: number }) => {
      setTankLevel(data.level);

      // Auto-control logic (if in auto mode)
      if (isAutoMode) {
        if (data.level < 20 && !isPumpOn) {
          handleTogglePump(true);
        } else if (data.level > 90 && isPumpOn) {
          handleTogglePump(false);
        }
      }
    });

    // Listen for peer updates (if pump is toggled from hardware physical button)
    socketInstance.on('hardware:pump-status', (data: { status: boolean }) => {
      setIsPumpOn(data.status);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAutoMode, isPumpOn]);

  const handleTogglePump = (status?: boolean) => {
    const newStatus = status !== undefined ? status : !isPumpOn;
    setIsPumpOn(newStatus);

    // Emit to backend to relay to ESP8266
    if (socket) {
      socket.emit('commands:toggle-pump', {
        deviceId: DEVICE_CONFIG.id,
        status: newStatus
      });
      toast.info(`Manual Override: Pump ${newStatus ? 'Started' : 'Stopped'}`);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Cpu className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Smart Tank Link</h1>
          </div>
          <p className="text-slate-500 max-w-md font-medium">Real-time hardware bridge for automated water storage and distribution.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Device Status</div>
            <div className={`text-sm font-bold ${isConnecting ? 'text-orange-500' : 'text-emerald-600'}`}>
              {isConnecting ? 'Reconnecting...' : 'Synchronized'}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isConnecting ? 'bg-orange-50' : 'bg-emerald-50'}`}>
            <Wifi className={`${isConnecting ? 'text-orange-500' : 'text-emerald-600'} animate-pulse`} size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Visualization */}
        <div className="lg:col-span-4 self-center">
          <WaterTank
            level={tankLevel}
            isPumpOn={isPumpOn}
            onTogglePump={() => handleTogglePump()}
            temp={22.8}
            quality="Optimal"
          />
        </div>

        {/* Control and Config Panels */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Automation Control */}
          <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col justify-between gap-8 h-full shadow-sm">
            <div className="space-y-4">
              <div className="p-3 bg-blue-600 rounded-2xl w-fit shadow-lg shadow-blue-200">
                <RefreshCcw className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider italic italic-no">Automation Engine</h2>
              <p className="text-slate-600 text-sm font-medium">AI-driven cycle: Refills below 20% and stops automatically at 95% volume.</p>
            </div>

            <button
              onClick={() => {
                setIsAutoMode(!isAutoMode);
                toast.success(`Automation Mode: ${!isAutoMode ? 'ENABLED' : 'DISABLED'}`);
              }}
              className={`group flex items-center justify-between p-6 rounded-2xl transition-all duration-500 ${isAutoMode ? 'bg-blue-600 shadow-xl shadow-blue-200' : 'bg-white border border-slate-200 hover:bg-slate-50'
                }`}
            >
              <span className={`text-lg font-black uppercase tracking-widest ${isAutoMode ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {isAutoMode ? 'Smart-Auto Active' : 'Manual Control Only'}
              </span>
              {isAutoMode ? <Play className="text-white" fill="white" size={20} /> : <Pause className="text-slate-300 group-hover:text-slate-400" size={20} />}
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            <StatsCard label="Last Pulse" value={DEVICE_CONFIG.lastSeen} icon={<RefreshCcw size={16} />} color="text-sky-400" />
            <StatsCard label="Signal Strength" value={`${DEVICE_CONFIG.signal} dBm`} icon={<Wifi size={16} />} color="text-amber-400" />
            <StatsCard label="Pump Utilization" value="12.4h / Month" icon={<Power size={16} />} color="text-purple-400" />
            <StatsCard label="Estimated Outflow" value="450L / Day" icon={<Database size={16} />} color="text-indigo-400" />
          </div>

          {/* Device Metadata */}
          <div className="p-8 bg-white rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <Terminal size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Hardware Identity</h3>
            </div>

            <div className="space-y-4">
              <MetadataRow label="Asset ID" value={DEVICE_CONFIG.id} />
              <MetadataRow label="Build Version" value={DEVICE_CONFIG.model} />
              <MetadataRow label="MAC Address" value={DEVICE_CONFIG.mac} />
              <MetadataRow label="Firmware" value="shrimp-core-v1.2.0" />
            </div>
          </div>

          {/* Debug Console / Logs */}
          <div className="p-8 bg-slate-900 rounded-3xl relative overflow-hidden flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-500">
                <Info size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest">Operational Insights</h3>
              </div>
              <div className="px-2 py-1 bg-amber-500/20 text-amber-500 text-[10px] uppercase font-bold rounded-md flex items-center gap-1">
                <AlertTriangle size={10} /> Live Data Feed
              </div>
            </div>

            <div className="space-y-3 font-mono text-[10px]">
              <LogEntry time="16:34:12" msg="Socket connected on channel hardware:data:relay" type="system" />
              <LogEntry time="16:34:15" msg="Ultrasonic Pulse: Data valid @ 65% level" type="data" />
              <LogEntry time="16:34:20" msg="Relay Standby: Ready for manual trigger" type="data" />
              <LogEntry time="16:35:05" msg="Network jitter detected: 140ms latency" type="info" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, icon, color }: any) => (
  <div className="p-6 bg-white rounded-3xl border border-slate-200 flex flex-col gap-3 shadow-sm">
    <div className={`p-2 bg-slate-50 rounded-xl w-fit ${color}`}>{icon}</div>
    <div>
      <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{label}</div>
      <div className="text-xl font-bold text-slate-900 tracking-tight">{value}</div>
    </div>
  </div>
);

const MetadataRow = ({ label, value }: any) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-slate-400 text-xs font-medium uppercase tracking-tighter">{label}</span>
    <span className="text-slate-700 text-sm font-bold font-mono">{value}</span>
  </div>
);

const LogEntry = ({ time, msg, type }: any) => (
  <div className="flex items-start gap-4">
    <span className="text-slate-600 shrink-0 tabular-nums">{time}</span>
    <span className={`italic-no ${type === 'system' ? 'text-blue-400' : type === 'data' ? 'text-emerald-400' : 'text-slate-500'}`}>
      {msg}
    </span>
  </div>
);

export default SmartTankPage;
