"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, RefreshCcw, Wifi, Database, Info, AlertTriangle, Play, Pause, Power, Terminal } from 'lucide-react';
import WaterTank from '@/components/retailer/smart-tank/WaterTank';
import useTankStore from '@/data/store/useTankStore';
import { toast } from 'sonner';

const SmartTankPage = () => {
    const {
        tankLevel,
        isPumpOn,
        isAutoMode,
        isConnecting,
        deviceConfig,
        logs,
        initSocket,
        togglePump,
        toggleAutoMode
    } = useTankStore();

    useEffect(() => {
        initSocket();
    }, [initSocket]);

    const handleTogglePump = (status?: boolean) => {
        const newStatus = status !== undefined ? status : !isPumpOn;
        togglePump(newStatus);
        toast.info(`Manual Override: Pump ${newStatus ? 'Started' : 'Stopped'}`);
    };

    const handleToggleAutoMode = () => {
        toggleAutoMode();
        toast.success(`Automation Mode: ${!isAutoMode ? 'ENABLED' : 'DISABLED'}`);
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 uppercase tracking-tighter">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                            <Cpu className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900  uppercase tracking-tighter">Smart Tank Link</h1>
                    </div>
                    <p className="text-slate-500 max-w-md font-medium normal-case tracking-normal">Real-time hardware bridge for automated water storage and distribution.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-black tracking-widest">Device Status</div>
                        <div className={`text-sm font-black ${isConnecting ? 'text-orange-500' : 'text-emerald-600'}`}>
                            {isConnecting ? 'Reconnecting...' : 'Synchronized'}
                        </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${isConnecting ? 'bg-orange-50' : 'bg-emerald-50'}`}>
                        <Wifi className={`${isConnecting ? 'text-orange-500' : 'text-emerald-600'} ${isConnecting ? 'animate-bounce' : 'animate-pulse'}`} size={24} />
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
                    <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col justify-between gap-8 h-full shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-600 rounded-2xl w-fit shadow-lg shadow-blue-200">
                                <RefreshCcw className="text-white" size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider italic italic-no">Automation Engine</h2>
                            <p className="text-slate-600 text-sm font-medium">AI-driven cycle: Refills below 20% and stops automatically at 95% volume.</p>
                        </div>

                        <button
                            onClick={handleToggleAutoMode}
                            className={`group flex items-center justify-between p-6 rounded-2xl transition-all duration-500 ${isAutoMode ? 'bg-blue-600 shadow-xl shadow-blue-200' : 'bg-white border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <span className={`text-lg font-black uppercase tracking-widest ${isAutoMode ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {isAutoMode ? 'Smart-Auto Active' : 'Manual Control Only'}
                            </span>
                            {isAutoMode ? <Play className="text-white animate-pulse" fill="white" size={20} /> : <Pause className="text-slate-300 group-hover:text-slate-400" size={20} />}
                        </button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <StatsCard label="Last Pulse" value={deviceConfig.lastSeen} icon={<RefreshCcw size={16} />} color="text-sky-400" />
                        <StatsCard label="Signal Strength" value={`${deviceConfig.signal} dBm`} icon={<Wifi size={16} />} color="text-amber-400" />
                        <StatsCard label="Pump Utilization" value="12.4h / Month" icon={<Power size={16} />} color="text-purple-400" />
                        <StatsCard label="Estimated Outflow" value="450L / Day" icon={<Database size={16} />} color="text-indigo-400" />
                    </div>

                    {/* Device Metadata */}
                    <div className="p-8 bg-white rounded-3xl border border-slate-200 space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Terminal size={18} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Hardware Identity</h3>
                        </div>

                        <div className="space-y-4">
                            <MetadataRow label="Asset ID" value={deviceConfig.id} />
                            <MetadataRow label="Build Version" value={deviceConfig.model} />
                            <MetadataRow label="MAC Address" value={deviceConfig.mac} />
                            <MetadataRow label="Firmware" value="shrimp-core-v1.2.0" />
                        </div>
                    </div>

                    {/* Debug Console / Logs */}
                    <div className="p-8 bg-slate-900 rounded-3xl relative overflow-hidden flex flex-col gap-4 shadow-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Info size={18} />
                                <h3 className="text-sm font-black uppercase tracking-widest">Operational Insights</h3>
                            </div>
                            <div className="px-2 py-1 bg-amber-500/20 text-amber-500 text-[10px] uppercase font-bold rounded-md flex items-center gap-1 border border-amber-500/30">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" /> Live Data Feed
                            </div>
                        </div>

                        <div className="space-y-3 font-mono text-[10px] max-h-[160px] overflow-y-auto scrollbar-hide">
                            <AnimatePresence mode="popLayout">
                                {logs.map((log: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                    >
                                        <LogEntry time={log.time} msg={log.msg} type={log.type} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ label, value, icon, color }: any) => (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-300">
        <div className={`p-2 bg-slate-50 rounded-xl w-fit ${color}`}>{icon}</div>
        <div>
            <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{label}</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>
    </div>
);

const MetadataRow = ({ label, value }: any) => (
    <div className="flex items-center justify-between py-1 group">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-tighter group-hover:text-slate-500 transition-colors">{label}</span>
        <span className="text-slate-700 text-sm font-bold font-mono group-hover:text-blue-600 transition-colors">{value}</span>
    </div>
);

const LogEntry = ({ time, msg, type }: any) => (
    <div className="flex items-start gap-4">
        <span className="text-slate-600 shrink-0 tabular-nums">{time}</span>
        <span className={`italic-no break-words ${type === 'system' ? 'text-blue-400' : type === 'data' ? 'text-emerald-400' : 'text-slate-500'}`}>
            {msg}
        </span>
    </div>
);

export default SmartTankPage;
