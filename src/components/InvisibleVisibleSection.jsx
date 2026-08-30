import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const ease = [0.22, 1, 0.36, 1];

const concepts = [
  {
    title: 'DATA',
    description: 'Everything you send online — messages, photos, video — becomes digital data.',
    icon: DataIcon,
    color: '#4FF2E8',
  },
  {
    title: 'PACKETS',
    description: 'Your data is split into small packets, each finding its own way through the network.',
    icon: PacketsIcon,
    color: '#4FF2E8',
  },
  {
    title: 'ROUTES',
    description: 'Packets travel through many possible paths, choosing the fastest route available.',
    icon: RoutesIcon,
    color: '#4FF2E8',
  },
  {
    title: 'DESTINATION',
    description: 'At the other end, packets reassemble into the original message, delivered in milliseconds.',
    icon: DestinationIcon,
    color: '#3DFFB0',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease,
    },
  }),
};

export default function InvisibleVisibleSection() {
  return (
    <section className="relative py-20 md:py-32 px-4 md:px-8" aria-label="Concepts explained">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#EAF0FF] mb-4">
            THE INTERNET IS INVISIBLE.
            <br />
            <span className="text-[#4FF2E8]">THE JOURNEY ISN'T.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {concepts.map((concept, i) => (
            <motion.div
              key={concept.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{
                y: -4,
                transition: { duration: 0.3 },
              }}
              className="glass-panel p-6 md:p-8 group cursor-default
                hover:border-[rgba(79,242,232,0.2)] transition-colors duration-500"
            >
              <div className="mb-5 w-12 h-12 rounded-xl bg-[rgba(79,242,232,0.06)] 
                flex items-center justify-center group-hover:bg-[rgba(79,242,232,0.12)]
                transition-colors duration-500">
                <concept.icon color={concept.color} />
              </div>
              <h3 className="text-[#EAF0FF] font-bold text-lg tracking-wider mb-3">
                {concept.title}
              </h3>
              <p className="text-[#8B93A7] text-sm leading-relaxed">
                {concept.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Animated icons
function DataIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <motion.rect
        x="3" y="3" width="18" height="18" rx="3"
        stroke={color} strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
      />
      <motion.line
        x1="8" y1="9" x2="16" y2="9"
        stroke={color} strokeWidth="1.5" strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.line
        x1="8" y1="13" x2="14" y2="13"
        stroke={color} strokeWidth="1.5" strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.line
        x1="8" y1="17" x2="12" y2="17"
        stroke={color} strokeWidth="1.5" strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      />
    </svg>
  );
}

function PacketsIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={4 + i * 6} y={8}
          width="6" height="8" rx="1.5"
          stroke={color} strokeWidth="1.5"
          fill="none"
          animate={{
            x: [4 + i * 6, 4 + i * 6 + 2, 12 - 3, 12 - 3, 4 + i * 6],
            opacity: [1, 1, 0.8, 0.8, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
    </svg>
  );
}

function RoutesIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M4 12h4l2-4 4 8 2-4h4"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx="4" cy="12" r="2" fill={color} opacity={0.3} />
      <circle cx="20" cy="12" r="2" fill={color} opacity={0.3} />
    </svg>
  );
}

function DestinationIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round"
        fill="none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}
