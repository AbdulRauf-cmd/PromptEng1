import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  { title: "Packet Created", desc: "Your message is broken into data packets, wrapped in headers." },
  { title: "Local Router", desc: "Your router receives the packet and determines the best next hop." },
  { title: "Routing via ISP", desc: "Your ISP routes the packet across its network toward the wider internet." },
  { title: "Internet Transit", desc: "The packet hops across multiple servers, finding the fastest path." },
  { title: "Delivered", desc: "The packet arrives. The message is reassembled and displayed." }
];

export default function ExplanationPanel({
  currentStepIndex,
  state,
  progress,
  activePath,
  hops,
  isRunning,
  message
}) {
  // Generate stable latency once per run
  const [latency, setLatency] = useState(0);
  
  useEffect(() => {
    if (isRunning && latency === 0) {
      setLatency(Math.floor(Math.random() * (85 - 28 + 1)) + 28);
    } else if (!isRunning && currentStepIndex === -1) {
      setLatency(0); // reset when stopped/idle
    }
  }, [isRunning, latency, currentStepIndex]);

  const showMetadata = isRunning || currentStepIndex === 4;

  return (
    <div className="glass-panel p-6 rounded-2xl w-full lg:w-80 flex flex-col gap-6 text-white bg-white/5 border border-white/10 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-[#4FF2E8] tracking-wider text-sm uppercase">What's Happening?</h2>
        {isRunning && (
          <motion.div 
            className="w-2 h-2 rounded-full bg-[#4FF2E8]"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Stepper */}
      <div className="flex flex-col relative">
        {/* Progress Line */}
        <div className="absolute left-[11px] top-[14px] bottom-[14px] w-[2px] bg-white/10 rounded-full">
           <motion.div 
             className="w-full bg-[#4FF2E8] rounded-full"
             initial={{ height: 0 }}
             animate={{ height: `${Math.max(0, Math.min(100, (currentStepIndex / (steps.length - 1)) * 100))}%` }}
             transition={{ duration: 0.5 }}
           />
        </div>

        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isPast = index < currentStepIndex;
          
          return (
            <div key={index} className="flex gap-4 relative z-10 mb-6 last:mb-0">
              {/* Indicator */}
              <div className="flex-shrink-0 relative">
                <motion.div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${
                    isActive ? 'border-[#4FF2E8] bg-[#4FF2E8]/20 text-[#4FF2E8]' : 
                    isPast ? 'border-[#3DFFB0] bg-[#3DFFB0] text-black' : 
                    'border-[#8B93A7] bg-transparent text-[#8B93A7]'
                  }`}
                >
                  {isPast ? (
                    <Check size={12} strokeWidth={3} />
                  ) : isActive && index === 4 ? (
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#4FF2E8]"
                    >
                      <motion.polyline 
                        points="20 6 9 17 4 12" 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </motion.svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
              </div>

              {/* Content */}
              <div className="pt-0.5">
                <h3 className={`text-sm font-bold mb-1 transition-colors duration-300 ${
                  isActive ? 'text-[#4FF2E8] text-base' :
                  isPast ? 'text-white/60' :
                  'text-[#8B93A7]'
                }`}>
                  {step.title}
                </h3>
                <AnimatePresence>
                  {isActive && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-white/80 leading-relaxed overflow-hidden"
                    >
                      {step.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metadata Readout */}
      <AnimatePresence>
        {showMetadata && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 pt-4 border-t border-white/10 font-mono text-xs space-y-2"
          >
            <div className="flex justify-between">
              <span className="text-[#4FF2E8]">Packet size:</span>
              <span className="text-white/60">64 KB (simulated)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4FF2E8]">Route:</span>
              <span className="text-white/60">ISP → Server {activePath || 'A'} → Dest</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4FF2E8]">Hops:</span>
              <span className="text-white/60">{hops || 0} (simulated)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4FF2E8]">Status:</span>
              <span className={currentStepIndex === 4 ? 'text-[#3DFFB0]' : 'text-[#4FF2E8]'}>
                {currentStepIndex === 4 ? 'DELIVERED' : 'IN TRANSIT'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4FF2E8]">Latency:</span>
              <span className="text-white/60">{latency || 32}ms (simulated)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARIA Live Region for accessibility */}
      <div aria-live="polite" className="sr-only">
        {currentStepIndex >= 0 && currentStepIndex <= 4 ? steps[currentStepIndex].title : ''}
        {currentStepIndex === 4 ? ' Message Delivered.' : ''}
      </div>
    </div>
  );
}
