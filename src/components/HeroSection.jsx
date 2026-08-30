import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Custom hook for the animated counter
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};

// Magnetic Button Component
const MagneticButton = ({ children, onClick, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    // max translate of 8px
    x.set(((clientX - centerX) / width) * 16);
    y.set(((clientY - centerY) / height) * 16);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x, y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative rounded-full px-8 py-4 font-semibold tracking-wide transition-colors ${className}`}
      aria-label="Send a data packet"
    >
      {children}
    </motion.button>
  );
};

// Canvas Background Component
const NetworkBackground = ({ mouseX, mouseY }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const numParticles = 20; // 15-20 nodes as requested

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#4FF2E8';
      ctx.strokeStyle = 'rgba(79, 242, 232, 0.15)';
      ctx.lineWidth = 0.5;

      // Update positions
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      // Draw lines and points
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particles[i].radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        x: useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [15, -15]),
        y: useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [15, -15]),
      }}
    />
  );
};

export default function HeroSection() {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const count = useCounter(4300000000, 2000); // Counts to 4.3 billion over ~2 seconds

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const scrollToSimulator = (e) => {
    e.preventDefault();
    const simSection = document.getElementById('simulator');
    if (simSection) {
      simSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const floatingLabels = [
    { text: 'DEVICE', top: '15%', left: '10%' },
    { text: 'ROUTER', top: '25%', right: '15%' },
    { text: 'ISP', top: '55%', left: '15%' },
    { text: 'INTERNET', top: '65%', right: '10%' },
    { text: 'SERVER', top: '80%', left: '20%' },
  ];

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#05060A] to-[#0B0E17] text-white font-sans"
    >
      <NetworkBackground mouseX={mouseX} mouseY={mouseY} />

      {/* Floating Labels (hidden on mobile) */}
      <div className="absolute inset-0 z-0 hidden md:block pointer-events-none">
        {floatingLabels.map((label, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.25, y: 0 }}
            transition={{ delay: 1 + idx * 0.2, duration: 1 }}
            className="absolute text-xs tracking-[0.2em] text-[#4FF2E8] font-mono"
            style={{ top: label.top, left: label.left, right: label.right }}
          >
            {label.text}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#4FF2E8] text-sm md:text-base tracking-[0.3em] font-semibold mb-6 uppercase"
        >
          The Invisible Internet
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#EAF0FF] mb-8 leading-tight tracking-tight"
        >
          WHERE DOES <br className="hidden md:block" /> YOUR DATA GO?
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="text-3xl md:text-4xl font-mono text-[#EAF0FF] font-light tracking-wider mb-2">
            {count.toLocaleString()}
          </div>
          <p className="text-sm md:text-base text-[#8B93A7]">
            packets travel the internet every second <span className="text-xs opacity-60">(illustrative figure)</span>
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-lg md:text-xl text-[#8B93A7] max-w-2xl mb-12 leading-relaxed"
        >
          You click Send. In milliseconds, your message begins a journey through a network you can't see.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          <MagneticButton
            onClick={scrollToSimulator}
            className="bg-[rgba(79,242,232,0.1)] border border-[rgba(79,242,232,0.3)] text-[#4FF2E8] hover:bg-[rgba(79,242,232,0.2)] hover:border-[#4FF2E8] backdrop-blur-md shadow-[0_0_20px_rgba(79,242,232,0.15)] hover:shadow-[0_0_30px_rgba(79,242,232,0.3)]"
          >
            SEND A DATA PACKET →
          </MagneticButton>

          <a
            href="#simulator"
            onClick={scrollToSimulator}
            className="text-sm text-[#8B93A7] hover:text-[#EAF0FF] transition-colors underline underline-offset-4 opacity-80 hover:opacity-100"
          >
            Explore the invisible journey of information across the internet.
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-8 h-8 text-[#8B93A7] opacity-60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
