import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RotateCcw } from 'lucide-react';
import { STATES } from '../hooks/useSimulation';

const ease = [0.22, 1, 0.36, 1];

export default function SimulationSection({
  state,
  message,
  setMessage,
  isRunning,
  send,
  reset,
  packetsSent,
  children,
}) {
  const inputRef = useRef(null);
  const isDelivered = state === STATES.DELIVERED;
  const isIdle = state === STATES.IDLE;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !isRunning && !isDelivered) {
      send();
    }
  }, [send, isRunning, isDelivered]);

  const handleReset = useCallback(() => {
    reset();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [reset]);

  return (
    <section
      id="simulator"
      className="relative py-20 md:py-32 px-4 md:px-8"
      aria-label="Data Packet Simulator"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-[#4FF2E8] mb-3 font-medium">
            Interactive Simulation
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-[#EAF0FF] mb-4">
            TRACE A DATA PACKET
          </h2>
          <p className="text-[#8B93A7] text-lg max-w-2xl mx-auto">
            Watch your message become a packet and cross the internet in real time.
          </p>
        </motion.div>

        {/* Input row */}
        <motion.div
          className="max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
        >
          <div className="glass-panel p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isRunning}
                placeholder="Type a message to send..."
                maxLength={140}
                className="w-full bg-transparent border-0 px-4 py-3 text-[#EAF0FF] placeholder-[#8B93A7]/50 
                  focus:outline-none font-medium text-base disabled:opacity-50"
                aria-label="Message to send as a data packet"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B93A7]/50 tabular-nums">
                {message.length}/140
              </span>
            </div>
            
            <AnimatePresence mode="wait">
              {isDelivered ? (
                <motion.button
                  key="reset"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease }}
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                    bg-[rgba(255,255,255,0.06)] text-[#EAF0FF] font-semibold text-sm
                    hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer
                    whitespace-nowrap"
                  aria-label="Reset simulation"
                >
                  <RotateCcw size={16} />
                  RESET
                </motion.button>
              ) : (
                <motion.button
                  key="send"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease }}
                  onClick={send}
                  disabled={isRunning || !message.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                    whitespace-nowrap cursor-pointer
                    bg-[#4FF2E8] text-[#05060A] 
                    hover:bg-[#6ff5ed] 
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-300"
                  style={{
                    boxShadow: isRunning ? 'none' : '0 0 20px rgba(79, 242, 232, 0.3), 0 0 40px rgba(79, 242, 232, 0.1)',
                  }}
                  aria-label="Send data packet"
                >
                  <Send size={16} />
                  {isRunning ? 'SENDING...' : 'SEND DATA'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Packetization animation overlay */}
        <AnimatePresence>
          {state === STATES.PACKETIZING && (
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PacketizationEffect message={message} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Network + Panel layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {children}
        </div>

        {/* Session counter */}
        {packetsSent > 0 && (
          <motion.p
            className="text-center mt-8 text-xs text-[#8B93A7]/60 tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Packets traced this session: {packetsSent}
          </motion.p>
        )}
      </div>

      {/* ARIA live region for announcements */}
      <div aria-live="polite" className="sr-only">
        {state === STATES.PACKETIZING && 'Creating data packet from your message.'}
        {state === STATES.DEVICE_TO_ROUTER && 'Packet traveling from device to router.'}
        {state === STATES.ROUTER_TO_ISP && 'Packet routing through ISP.'}
        {state === STATES.ISP_TO_INTERNET && 'Selecting route through the internet.'}
        {state === STATES.INTERNET_TO_SERVER && 'Packet crossing internet servers.'}
        {state === STATES.SERVER_TO_DESTINATION && 'Packet arriving at destination.'}
        {state === STATES.DELIVERED && 'Packet successfully delivered!'}
      </div>
    </section>
  );
}

// Packetization effect: text shatters into fragments then reassembles
function PacketizationEffect({ message }) {
  const fragments = message.slice(0, 30).split('').reduce((acc, char, i) => {
    const chunkIndex = Math.floor(i / Math.max(1, Math.ceil(message.slice(0, 30).length / 4)));
    if (!acc[chunkIndex]) acc[chunkIndex] = '';
    acc[chunkIndex] += char;
    return acc;
  }, []);

  return (
    <div className="relative h-12 flex items-center justify-center gap-1">
      {fragments.map((frag, i) => (
        <motion.span
          key={i}
          className="inline-block px-2 py-1 rounded text-xs font-mono text-[#4FF2E8] 
            border border-[rgba(79,242,232,0.3)] bg-[rgba(79,242,232,0.05)]"
          initial={{
            opacity: 0,
            y: (i % 2 === 0 ? -1 : 1) * 20,
            x: (i - fragments.length / 2) * 30,
            scale: 0.5,
          }}
          animate={{
            opacity: [0, 1, 1, 0.8],
            y: [null, 0, 0, 0],
            x: [null, (i - fragments.length / 2) * 10, 0, 0],
            scale: [0.5, 1, 1, 0.9],
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.3, 0.7, 1],
          }}
        >
          {frag}
        </motion.span>
      ))}
    </div>
  );
}
