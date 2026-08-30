import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATES } from '../hooks/useSimulation';

const NODES = {
  device: { id: 'device', x: 80, y: 200, label: 'DEVICE', icon: 'laptop' },
  router: { id: 'router', x: 240, y: 200, label: 'ROUTER', icon: 'router' },
  isp: { id: 'isp', x: 400, y: 200, label: 'ISP', icon: 'globe' },
  serverA: { id: 'serverA', x: 590, y: 110, label: 'SERVER A', icon: 'server', scale: 1.05 },
  serverB: { id: 'serverB', x: 590, y: 290, label: 'SERVER B', icon: 'server', scale: 1.05 },
  destination: { id: 'destination', x: 800, y: 200, label: 'DESTINATION', icon: 'flag', scale: 1.12 },
};

const ICON_PATHS = {
  laptop: (
    <g>
      <rect x="4" y="4" width="16" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 18h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),
  router: (
    <g>
      <rect x="4" y="10" width="16" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="14" r="1" fill="currentColor" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <path d="M12 4 L8 8 M12 4 L16 8 M12 2 L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),
  globe: (
    <g>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="5" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="5" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    </g>
  ),
  server: (
    <g>
      <rect x="5" y="2" width="14" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="10" width="14" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="5" r="1" fill="currentColor" />
      <circle cx="8" cy="13" r="1" fill="currentColor" />
      <line x1="11" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="11" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
    </g>
  ),
  flag: (
    <g>
      <path d="M4 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 3h12l-3 4 3 4H4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="4" cy="21" r="1" fill="currentColor" />
    </g>
  ),
};

// Connection path definitions
const CONNECTIONS = [
  { from: 'device', to: 'router', states: [STATES.DEVICE_TO_ROUTER] },
  { from: 'router', to: 'isp', states: [STATES.ROUTER_TO_ISP] },
  { from: 'isp', to: 'serverA', states: [STATES.ISP_TO_INTERNET, STATES.INTERNET_TO_SERVER], path: 'A' },
  { from: 'isp', to: 'serverB', states: [STATES.ISP_TO_INTERNET, STATES.INTERNET_TO_SERVER], path: 'B' },
  { from: 'serverA', to: 'destination', states: [STATES.SERVER_TO_DESTINATION], path: 'A' },
  { from: 'serverB', to: 'destination', states: [STATES.SERVER_TO_DESTINATION], path: 'B' },
];

// Interpolate position between two points
function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function NetworkVisualization({
  state,
  progress,
  activePath,
  failedPath,
  activeNode,
  isRunning,
}) {
  // Ambient particles
  const particles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      cx: Math.random() * 900,
      cy: Math.random() * 400,
      r: Math.random() * 1.5 + 0.5,
      dur: Math.random() * 8 + 12,
      delay: Math.random() * 5,
      dx: (Math.random() - 0.5) * 30,
      dy: (Math.random() - 0.5) * 20,
    })),
    []
  );

  // Calculate packet position
  const packetPos = useMemo(() => {
    let from, to;

    switch (state) {
      case STATES.PACKETIZING:
        return { x: NODES.device.x, y: NODES.device.y, visible: true, angle: 0 };
      case STATES.DEVICE_TO_ROUTER:
        from = NODES.device; to = NODES.router;
        break;
      case STATES.ROUTER_TO_ISP:
        from = NODES.router; to = NODES.isp;
        break;
      case STATES.ISP_TO_INTERNET:
        from = NODES.isp;
        to = activePath === 'A' ? NODES.serverA : NODES.serverB;
        break;
      case STATES.INTERNET_TO_SERVER:
        from = activePath === 'A' ? NODES.serverA : NODES.serverB;
        to = activePath === 'A' ? NODES.serverA : NODES.serverB;
        // Packet is "at" the server, maybe pulsing
        return { x: from.x, y: from.y, visible: true, angle: 0 };
      case STATES.SERVER_TO_DESTINATION:
        from = activePath === 'A' ? NODES.serverA : NODES.serverB;
        to = NODES.destination;
        break;
      case STATES.DELIVERED:
        return { x: NODES.destination.x, y: NODES.destination.y, visible: true, angle: 0 };
      default:
        return { x: 0, y: 0, visible: false, angle: 0 };
    }

    if (from && to) {
      const x = lerp(from.x, to.x, progress);
      const y = lerp(from.y, to.y, progress);
      const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
      return { x, y, visible: true, angle };
    }

    return { x: 0, y: 0, visible: false, angle: 0 };
  }, [state, progress, activePath]);

  // Determine which connections have been traversed
  const getConnectionState = (conn) => {
    const isFailed = failedPath && conn.path === failedPath;
    if (isFailed) return 'failed';

    // Check if this connection's path matches active path
    if (conn.path && conn.path !== activePath) return 'inactive';

    // Check if currently animating through this connection
    const isCurrentSegment = conn.states.includes(state);
    if (isCurrentSegment && isRunning) return 'active';

    // Check if already traversed
    const stateOrder = [
      STATES.PACKETIZING, STATES.DEVICE_TO_ROUTER, STATES.ROUTER_TO_ISP,
      STATES.ISP_TO_INTERNET, STATES.INTERNET_TO_SERVER,
      STATES.SERVER_TO_DESTINATION, STATES.DELIVERED,
    ];
    const currentIdx = stateOrder.indexOf(state);
    const connFirstStateIdx = Math.min(...conn.states.map(s => stateOrder.indexOf(s)));

    if (currentIdx > connFirstStateIdx && isRunning) return 'traversed';
    if (state === STATES.DELIVERED) {
      if (!conn.path || conn.path === activePath) return 'traversed';
    }

    return 'idle';
  };

  return (
    <div className="flex-1 w-full">
      <svg
        viewBox="0 0 900 400"
        className="w-full h-auto"
        role="img"
        aria-label="Network visualization showing packet journey from device to destination"
      >
        <defs>
          {/* Glow filters */}
          <filter id="glow-packet" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" />
            <feGaussianBlur stdDeviation="14" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-node" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-success" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Comet trail gradient */}
          <linearGradient id="comet-grad">
            <stop offset="0%" stopColor="#4FF2E8" stopOpacity="0" />
            <stop offset="100%" stopColor="#4FF2E8" stopOpacity="0.8" />
          </linearGradient>

          {/* Radial glow for arrival burst */}
          <radialGradient id="arrival-burst">
            <stop offset="0%" stopColor="#3DFFB0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3DFFB0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient particles */}
        <g opacity="0.25">
          {particles.map((p, i) => (
            <motion.circle
              key={i}
              r={p.r}
              fill="#4FF2E8"
              initial={{ cx: p.cx, cy: p.cy, opacity: 0.2 }}
              animate={{
                cx: [p.cx, p.cx + p.dx, p.cx],
                cy: [p.cy, p.cy + p.dy, p.cy],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              }}
            />
          ))}
        </g>

        {/* Connection lines */}
        {CONNECTIONS.map((conn, i) => {
          const from = NODES[conn.from];
          const to = NODES[conn.to];
          const connState = getConnectionState(conn);

          let stroke = 'rgba(79, 242, 232, 0.12)';
          let strokeWidth = 1.5;
          let dashArray = 'none';
          let opacity = 1;

          switch (connState) {
            case 'active':
              stroke = '#4FF2E8';
              strokeWidth = 2;
              break;
            case 'traversed':
              stroke = 'rgba(79, 242, 232, 0.35)';
              strokeWidth = 2;
              break;
            case 'failed':
              stroke = '#FF5C5C';
              strokeWidth = 2;
              dashArray = '8 6';
              break;
            case 'inactive':
              opacity = 0.4;
              break;
          }

          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;

          return (
            <g key={i}>
              {/* Base line */}
              <motion.line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                animate={{ opacity }}
                transition={{ duration: 0.5 }}
              />

              {/* Flowing dash overlay for active connections */}
              {connState === 'active' && (
                <motion.line
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke="#4FF2E8"
                  strokeWidth={1}
                  strokeDasharray="4 12"
                  initial={{ strokeDashoffset: 16 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Idle flowing animation */}
              {connState === 'idle' && (
                <motion.line
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke="rgba(79, 242, 232, 0.08)"
                  strokeWidth={1}
                  strokeDasharray="2 16"
                  initial={{ strokeDashoffset: 18 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Failure icon */}
              {connState === 'failed' && (
                <g>
                  <motion.circle
                    cx={midX} cy={midY} r={12}
                    fill="#0B0E17"
                    stroke="#FF5C5C"
                    strokeWidth={1.5}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                  <text
                    x={midX} y={midY + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FF5C5C"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    ⚠
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {Object.values(NODES).map((node) => {
          const isActive = activeNode === node.id;
          const nodeScale = node.scale || 1;
          const baseR = 28 * nodeScale;

          return (
            <g key={node.id}>
              {/* Active glow ring */}
              {isActive && (
                <motion.circle
                  cx={node.x} cy={node.y} r={baseR + 8}
                  fill="none"
                  stroke="#4FF2E8"
                  strokeWidth={2}
                  filter="url(#glow-node)"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Idle pulse */}
              {!isActive && (
                <motion.circle
                  cx={node.x} cy={node.y} r={baseR + 4}
                  fill="none"
                  stroke="rgba(79, 242, 232, 0.1)"
                  strokeWidth={1}
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1.02, 0.98] }}
                  transition={{ duration: 3 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Glass background */}
              <circle
                cx={node.x} cy={node.y} r={baseR}
                fill="rgba(255, 255, 255, 0.04)"
                stroke={isActive ? '#4FF2E8' : 'rgba(255, 255, 255, 0.08)'}
                strokeWidth={isActive ? 1.5 : 1}
              />

              {/* Icon */}
              <g transform={`translate(${node.x - 12}, ${node.y - 12})`}>
                <svg width="24" height="24" viewBox="0 0 24 24"
                  style={{ color: isActive ? '#4FF2E8' : 'rgba(234, 240, 255, 0.7)' }}>
                  {ICON_PATHS[node.icon]}
                </svg>
              </g>

              {/* Label */}
              <text
                x={node.x} y={node.y + baseR + 18}
                textAnchor="middle"
                fill={isActive ? '#4FF2E8' : '#8B93A7'}
                fontSize="10"
                fontWeight="600"
                letterSpacing="1.5"
                fontFamily="monospace"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Arrival burst effect */}
        <AnimatePresence>
          {state === STATES.DELIVERED && (
            <motion.circle
              cx={NODES.destination.x}
              cy={NODES.destination.y}
              fill="url(#arrival-burst)"
              initial={{ r: 0, opacity: 1 }}
              animate={{ r: 80, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Packet orb */}
        <AnimatePresence>
          {packetPos.visible && isRunning && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Comet trail */}
              {packetPos.angle !== undefined && state !== STATES.PACKETIZING && state !== STATES.INTERNET_TO_SERVER && (
                <g transform={`translate(${packetPos.x}, ${packetPos.y}) rotate(${packetPos.angle})`}>
                  <ellipse
                    cx="-18" cy="0" rx="22" ry="3"
                    fill="url(#comet-grad)"
                    opacity="0.6"
                  />
                </g>
              )}

              {/* Outer glow */}
              <circle
                cx={packetPos.x} cy={packetPos.y} r={8}
                fill="#4FF2E8"
                opacity={0.15}
                filter="url(#glow-packet)"
              />

              {/* Core */}
              <circle
                cx={packetPos.x} cy={packetPos.y} r={5}
                fill="white"
              />
              <circle
                cx={packetPos.x} cy={packetPos.y} r={3.5}
                fill="#4FF2E8"
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Delivered checkmark */}
        <AnimatePresence>
          {state === STATES.DELIVERED && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <circle
                cx={NODES.destination.x}
                cy={NODES.destination.y}
                r={32 * 1.12}
                fill="none"
                stroke="#3DFFB0"
                strokeWidth={2}
                filter="url(#glow-success)"
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Hop counter */}
        <AnimatePresence>
          {(state === STATES.INTERNET_TO_SERVER || state === STATES.SERVER_TO_DESTINATION) && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <rect
                x="360" y="10"
                width="180" height="28"
                rx="14"
                fill="rgba(0,0,0,0.6)"
                stroke="rgba(79, 242, 232, 0.2)"
                strokeWidth="1"
              />
              <text
                x="450" y="28"
                textAnchor="middle"
                fill="#4FF2E8"
                fontSize="11"
                fontFamily="monospace"
              >
                Hops traversed (simulated)
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
