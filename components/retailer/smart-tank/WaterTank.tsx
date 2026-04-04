"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Power, Thermometer, Wind } from 'lucide-react';

interface WaterTankProps {
  level: number; // 0 to 100
  isPumpOn: boolean;
  onTogglePump: () => void;
  temp?: number;
  quality?: string;
}

const WaterTank: React.FC<WaterTankProps> = ({ 
  level, 
  isPumpOn, 
  onTogglePump, 
  temp = 24.5, 
  quality = "Good" 
}) => {
  // Determine color based on level
  const getLevelColor = () => {
    if (level > 60) return '#3b82f6'; // Blue
    if (level > 20) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const color = getLevelColor();

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
      <div className="relative w-48 h-80 flex items-center justify-center">
        {/* Tank Outer Shell (Cylinder) */}
        <div className="absolute inset-0 rounded-[2.5rem] border-4 border-white/20 bg-gradient-to-b from-white/10 to-transparent shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          
          {/* Glass Reflection */}
          <div className="absolute top-4 left-6 w-4 h-full bg-white/10 blur-md rounded-full transform -rotate-2" />
          
          {/* Water Content */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0"
            initial={{ height: '0%' }}
            animate={{ height: `${level}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 40 }}
            style={{ backgroundColor: color }}
          >
            {/* Wave Animation Overlay */}
            <motion.div 
              className="absolute top-0 left-[-100%] w-[400%] h-12"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              style={{
                background: `radial-gradient(circle at 50% 100%, ${color} 20%, rgba(255,255,255,0.2) 100%)`,
                maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 15 Q 50 0, 100 15 T 200 15 T 300 15 T 400 15 V 30 H 0 Z\' fill=\'black\' /%3E%3C/svg%3E")',
                maskSize: '100% 100%',
                WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 15 Q 50 0, 100 15 T 200 15 T 300 15 T 400 15 V 30 H 0 Z\' fill=\'black\' /%3E%3C/svg%3E")',
                WebkitMaskSize: '100% 100%',
              }}
            />
            
            {/* Subsurface glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
            
            {/* Bubbles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                animate={{
                  y: [0, -100],
                  opacity: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 10 : -10)],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + Math.random() * 2,
                  delay: i * 0.4,
                }}
                style={{ bottom: i * 20, left: 20 + Math.random() * 60 }}
              />
            ))}
          </motion.div>
        </div>

        {/* Level Percentage Display */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <motion.span 
              className="text-4xl font-black text-slate-900 drop-shadow-sm"
              key={level}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {Math.round(level)}%
            </motion.span>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Volume</div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Thermometer size={14} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Temp</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{temp}°C</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Wind size={14} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Quality</span>
          </div>
          <div className="text-lg font-bold text-emerald-600">{quality}</div>
        </div>
      </div>

      {/* Control Switch */}
      <div className="w-full">
        <button 
          onClick={onTogglePump}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${
            isPumpOn 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
          }`}
        >
          <motion.div
            animate={isPumpOn ? { rotate: [0, 360] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Power size={20} />
          </motion.div>
          <span className="font-black uppercase tracking-widest text-sm">
            Pump is {isPumpOn ? 'Active' : 'Standby'}
          </span>
        </button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPumpOn ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-[9px] uppercase tracking-tighter text-slate-400 font-bold">Hardware Link Stable</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets size={10} className="text-blue-500" />
          <span className="text-[9px] uppercase tracking-tighter text-slate-400 font-bold">Monitoring Active</span>
        </div>
      </div>
    </div>
  );
};

export default WaterTank;
