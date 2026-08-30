import { useState, useCallback, useRef, useEffect } from 'react';

// Simulation states
export const STATES = {
  IDLE: 'IDLE',
  PACKETIZING: 'PACKETIZING',
  DEVICE_TO_ROUTER: 'DEVICE_TO_ROUTER',
  ROUTER_TO_ISP: 'ROUTER_TO_ISP',
  ISP_TO_INTERNET: 'ISP_TO_INTERNET',
  INTERNET_TO_SERVER: 'INTERNET_TO_SERVER',
  SERVER_TO_DESTINATION: 'SERVER_TO_DESTINATION',
  DELIVERED: 'DELIVERED',
};

// Node IDs in order
export const NODES = ['device', 'router', 'isp', 'serverA', 'serverB', 'destination'];

// Path definitions
export const PATH_A = ['device', 'router', 'isp', 'serverA', 'destination'];
export const PATH_B = ['device', 'router', 'isp', 'serverB', 'destination'];

// Step definitions for the explanation panel
export const STEPS = [
  {
    id: 'packetize',
    title: 'Packet Created',
    description: 'Your message is broken into data packets, wrapped in headers with source and destination addresses.',
    state: STATES.PACKETIZING,
  },
  {
    id: 'router',
    title: 'Local Router',
    description: 'Your router receives the packet and determines the best next hop toward the destination.',
    state: STATES.DEVICE_TO_ROUTER,
  },
  {
    id: 'routing',
    title: 'Routing via ISP',
    description: 'Your Internet Service Provider routes the packet across its network toward the wider internet.',
    state: STATES.ROUTER_TO_ISP,
  },
  {
    id: 'server',
    title: 'Internet Transit',
    description: 'The packet hops across multiple servers and network nodes, finding the fastest available path.',
    state: STATES.ISP_TO_INTERNET,
  },
  {
    id: 'delivered',
    title: 'Delivered',
    description: 'The packet arrives at its destination. The message is reassembled and displayed.',
    state: STATES.DELIVERED,
  },
];

// Timing for each phase (ms)
const TIMINGS = {
  [STATES.PACKETIZING]: 600,
  [STATES.DEVICE_TO_ROUTER]: 1000,
  [STATES.ROUTER_TO_ISP]: 1000,
  [STATES.ISP_TO_INTERNET]: 1000,
  [STATES.INTERNET_TO_SERVER]: 1200,
  [STATES.SERVER_TO_DESTINATION]: 800,
};

// State sequence
const STATE_SEQUENCE = [
  STATES.PACKETIZING,
  STATES.DEVICE_TO_ROUTER,
  STATES.ROUTER_TO_ISP,
  STATES.ISP_TO_INTERNET,
  STATES.INTERNET_TO_SERVER,
  STATES.SERVER_TO_DESTINATION,
  STATES.DELIVERED,
];

export function useSimulation() {
  const [state, setState] = useState(STATES.IDLE);
  const [message, setMessage] = useState('Hello from the internet!');
  const [activePath, setActivePath] = useState('A'); // 'A' or 'B'
  const [failedPath, setFailedPath] = useState(null); // null, 'A', or 'B'
  const [progress, setProgress] = useState(0); // 0-1 within current segment
  const [hops, setHops] = useState(0);
  const [packetsSent, setPacketsSent] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  const isRunning = state !== STATES.IDLE && state !== STATES.DELIVERED;

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
  }, []);

  const animateProgress = useCallback((duration, onComplete) => {
    startTimeRef.current = performance.now();
    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        progressRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };
    progressRef.current = requestAnimationFrame(animate);
  }, []);

  const advanceState = useCallback((currentIndex) => {
    if (currentIndex >= STATE_SEQUENCE.length - 1) {
      setState(STATES.DELIVERED);
      setProgress(1);
      setPacketsSent(prev => prev + 1);
      return;
    }

    const nextState = STATE_SEQUENCE[currentIndex + 1];
    
    if (nextState === STATES.DELIVERED) {
      setState(STATES.DELIVERED);
      setProgress(1);
      setPacketsSent(prev => prev + 1);
      return;
    }

    setState(nextState);
    setProgress(0);

    // Increment hops for transit states
    if (nextState === STATES.INTERNET_TO_SERVER || nextState === STATES.SERVER_TO_DESTINATION) {
      setHops(prev => prev + 1);
    }

    const duration = TIMINGS[nextState] || 1000;
    animateProgress(duration, () => {
      advanceState(currentIndex + 1);
    });
  }, [animateProgress]);

  const send = useCallback(() => {
    if (isRunning || !message.trim()) return;
    
    clearTimers();
    setHops(0);
    setProgress(0);

    // Determine path based on failure state
    if (failedPath === 'A') {
      setActivePath('B');
    } else if (failedPath === 'B') {
      setActivePath('A');
    } else {
      setActivePath('A'); // Default
    }

    setState(STATES.PACKETIZING);
    
    const duration = TIMINGS[STATES.PACKETIZING];
    animateProgress(duration, () => {
      setHops(1);
      advanceState(0);
    });
  }, [isRunning, message, failedPath, clearTimers, animateProgress, advanceState]);

  const reset = useCallback(() => {
    clearTimers();
    setState(STATES.IDLE);
    setProgress(0);
    setHops(0);
    setToastMessage(null);
  }, [clearTimers]);

  const simulateFailure = useCallback(() => {
    const pathToFail = activePath === 'A' ? 'A' : 'A'; // Always fail path A for drama
    setFailedPath(pathToFail);
    setToastMessage({ type: 'danger', text: 'ROUTE UNAVAILABLE' });
    
    setTimeout(() => {
      setActivePath(pathToFail === 'A' ? 'B' : 'A');
      setToastMessage({ type: 'success', text: 'ALTERNATE ROUTE FOUND ✓' });
      
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }, 800);
  }, [activePath]);

  const restoreNetwork = useCallback(() => {
    setFailedPath(null);
    setActivePath('A');
    setToastMessage(null);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Calculate current active node based on state
  const getActiveNode = () => {
    switch (state) {
      case STATES.PACKETIZING: return 'device';
      case STATES.DEVICE_TO_ROUTER: return progress > 0.5 ? 'router' : 'device';
      case STATES.ROUTER_TO_ISP: return progress > 0.5 ? 'isp' : 'router';
      case STATES.ISP_TO_INTERNET: return 'isp';
      case STATES.INTERNET_TO_SERVER: return progress > 0.5 ? (activePath === 'A' ? 'serverA' : 'serverB') : 'isp';
      case STATES.SERVER_TO_DESTINATION: return progress > 0.5 ? 'destination' : (activePath === 'A' ? 'serverA' : 'serverB');
      case STATES.DELIVERED: return 'destination';
      default: return null;
    }
  };

  // Get overall progress (0-1)
  const getOverallProgress = () => {
    const stateIndex = STATE_SEQUENCE.indexOf(state);
    if (stateIndex === -1) return 0;
    const totalStates = STATE_SEQUENCE.length;
    return (stateIndex + progress) / totalStates;
  };

  // Current step index for explanation panel
  const getCurrentStepIndex = () => {
    switch (state) {
      case STATES.PACKETIZING: return 0;
      case STATES.DEVICE_TO_ROUTER: return 1;
      case STATES.ROUTER_TO_ISP: return 2;
      case STATES.ISP_TO_INTERNET:
      case STATES.INTERNET_TO_SERVER:
      case STATES.SERVER_TO_DESTINATION: return 3;
      case STATES.DELIVERED: return 4;
      default: return -1;
    }
  };

  return {
    state,
    message,
    setMessage,
    activePath,
    failedPath,
    progress,
    hops,
    packetsSent,
    toastMessage,
    isRunning,
    send,
    reset,
    simulateFailure,
    restoreNetwork,
    getActiveNode,
    getOverallProgress,
    getCurrentStepIndex,
  };
}
