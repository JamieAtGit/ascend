import { useMemo } from 'react';
import { NODES, CATEGORY_COLORS } from '../data/nodes';
import { useAscendStore } from '../store/useAscendStore';

const CANVAS_W = 4200;
const CANVAS_H = 850;

function edgeLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export default function NodeEdges() {
  const getNodeStatus = useAscendStore((s) => s.getNodeStatus);

  const edges = useMemo(() => {
    const result: Array<{
      id: string;
      x1: number; y1: number;
      x2: number; y2: number;
      color: string;
      level: 'inactive' | 'available' | 'active';
      len: number;
    }> = [];

    for (const node of NODES) {
      for (const reqId of node.requiredNodes) {
        const req = NODES.find((n) => n.id === reqId);
        if (!req) continue;
        const fromStatus = getNodeStatus(reqId);
        const toStatus = getNodeStatus(node.id);
        const isActive = fromStatus === 'unlocked' || fromStatus === 'mastered';
        const isAvailable = toStatus === 'available';
        const color = isActive ? CATEGORY_COLORS[node.category] : CATEGORY_COLORS[node.category];
        const len = edgeLen(req.position.x, req.position.y, node.position.x, node.position.y);
        result.push({
          id: `${reqId}-${node.id}`,
          x1: req.position.x, y1: req.position.y,
          x2: node.position.x, y2: node.position.y,
          color,
          level: isActive ? 'active' : isAvailable ? 'available' : 'inactive',
          len,
        });
      }
    }
    return result;
  }, [getNodeStatus]);

  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0,
        width: CANVAS_W, height: CANVAS_H,
        pointerEvents: 'none', overflow: 'visible',
      }}
    >
      <defs>
        {edges.filter(e => e.level === 'active').map((e) => (
          <filter key={`f-${e.id}`} id={`ef-${e.id}`} x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
      </defs>

      {edges.map((edge) => {
        if (edge.level === 'inactive') {
          return (
            <line key={edge.id}
              x1={edge.x1} y1={edge.y1}
              x2={edge.x2} y2={edge.y2}
              stroke="#1e1e1e"
              strokeWidth={0.8}
              opacity={0.6}
            />
          );
        }

        if (edge.level === 'available') {
          const dash = 6;
          const gap = 10;
          const dur = `${(edge.len / 60).toFixed(1)}s`;
          return (
            <g key={edge.id}>
              {/* Dim base line */}
              <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                stroke={edge.color} strokeWidth={0.6} opacity={0.12} />
              {/* Animated dashed flow */}
              <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                stroke={edge.color} strokeWidth={1}
                strokeDasharray={`${dash} ${gap}`}
                opacity={0.35}>
                <animate
                  attributeName="stroke-dashoffset"
                  from={edge.len}
                  to={0}
                  dur={dur}
                  repeatCount="indefinite"
                />
              </line>
            </g>
          );
        }

        // Active edge — fullly glowing with flowing energy
        const dashLen = 18;
        const dashGap = edge.len - dashLen;
        const dur = `${(edge.len / 90).toFixed(1)}s`;
        const durFast = `${(edge.len / 140).toFixed(1)}s`;

        return (
          <g key={edge.id}>
            {/* Wide bloom glow */}
            <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
              stroke={edge.color} strokeWidth={6}
              opacity={0.08}
              filter={`url(#ef-${edge.id})`}
            />
            {/* Medium glow */}
            <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
              stroke={edge.color} strokeWidth={2}
              opacity={0.18}
            />
            {/* Crisp core line */}
            <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
              stroke={edge.color} strokeWidth={0.8}
              opacity={0.6}
            />
            {/* Flowing energy pulse — slow */}
            <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
              stroke={edge.color} strokeWidth={2}
              strokeDasharray={`${dashLen} ${dashGap}`}
              strokeLinecap="round"
              opacity={0.75}>
              <animate
                attributeName="stroke-dashoffset"
                from={edge.len}
                to={0}
                dur={dur}
                repeatCount="indefinite"
              />
            </line>
            {/* Second faster pulse — offset for layered feel */}
            <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
              stroke="#ffffff" strokeWidth={1}
              strokeDasharray={`6 ${edge.len - 6}`}
              strokeLinecap="round"
              opacity={0.35}>
              <animate
                attributeName="stroke-dashoffset"
                from={edge.len}
                to={0}
                dur={durFast}
                repeatCount="indefinite"
              />
            </line>
          </g>
        );
      })}
    </svg>
  );
}
