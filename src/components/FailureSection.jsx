import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1];

export default function FailureSection({
  failedPath,
  simulateFailure,
  restoreNetwork,
  toastMessage,
}) {
  const isFailureMode = failedPath !== null;

  return (
    <section className="relative py-20 md:py-32 px-4 md:px-8" aria-label="Network failure simulation">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-[#4FF2E8] mb-3 font-medium">
            Network Resilience
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-[#EAF0FF] mb-4">
            WHAT IF ONE ROUTE BREAKS?
          </h2>
          <p className="text-[#8B93A7] text-lg max-w-2xl mx-auto">
            The internet isn't one road. It's a network of many possible paths.
          </p>
        </motion.div>

        {/* Toggle buttons */}
        <motion.div
          className="flex justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
        >
          <button
            onClick={restoreNetwork}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
              transition-all duration-500 cursor-pointer whitespace-nowrap
              ${!isFailureMode
                ? 'bg-[#4FF2E8] text-[#05060A] shadow-[0_0_20px_rgba(79,242,232,0.3)]'
                : 'bg-[rgba(255,255,255,0.06)] text-[#8B93A7] hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            aria-pressed={!isFailureMode}
          >
            <Wifi size={16} />
            NORMAL NETWORK
          </button>

          <button
            onClick={simulateFailure}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
              transition-all duration-500 cursor-pointer whitespace-nowrap
              ${isFailureMode
                ? 'bg-[#FF5C5C] text-white shadow-[0_0_20px_rgba(255,92,92,0.3)]'
                : 'bg-[rgba(255,255,255,0.06)] text-[#8B93A7] hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            aria-pressed={isFailureMode}
          >
            <WifiOff size={16} />
            SIMULATE FAILURE
          </button>
        </motion.div>

        {/* Toast messages */}
        <div className="flex justify-center min-h-[56px]">
          <AnimatePresence mode="wait">
            {toastMessage && (
              <motion.div
                key={toastMessage.text}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  ...(toastMessage.type === 'danger' ? {
                    x: [0, -4, 4, -4, 4, 0],
                  } : {}),
                }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.4, ease }}
                className={`glass-panel px-6 py-3 flex items-center gap-3 font-semibold text-sm
                  ${toastMessage.type === 'danger'
                    ? 'border-[rgba(255,92,92,0.3)] text-[#FF5C5C]'
                    : 'border-[rgba(61,255,176,0.3)] text-[#3DFFB0]'
                  }`}
                role="alert"
              >
                {toastMessage.type === 'danger' ? (
                  <AlertTriangle size={18} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <motion.path
                      d="M20 6L9 17l-5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    />
                  </svg>
                )}
                {toastMessage.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Explanation */}
        <motion.div
          className="mt-10 glass-panel p-6 md:p-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(79,242,232,0.1)] flex items-center justify-center flex-shrink-0 mt-1">
              <Wifi size={18} className="text-[#4FF2E8]" />
            </div>
            <div>
              <h3 className="text-[#EAF0FF] font-bold text-lg mb-2">Redundancy in action</h3>
              <p className="text-[#8B93A7] text-sm leading-relaxed">
                When a network path fails, routers automatically detect the problem and redirect traffic
                through alternative routes. This is why the internet is resilient — your data finds a way,
                even when parts of the network go down. Try simulating a failure above and then sending
                a packet to see it in action.
              </p>
              <p className="text-[#8B93A7]/50 text-xs mt-3 italic">
                (This is a simplified simulation for educational purposes)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
