import React from 'react';
import type { ConnectionLinesProps } from '../types';

// ─── Geometry helpers ────────────────────────────────────────────────────────

/**
 * Determine which edge midpoint a connection should exit/enter a component from,
 * based on the direction vector toward the OTHER component's center.
 */
function getPort(comp: any, direction: { dx: number; dy: number }): { x: number; y: number } {
  const { x, y, width, height } = {
    x: comp.position.x,
    y: comp.position.y,
    width: comp.size.width,
    height: comp.size.height,
  };
  const cx = x + width / 2;
  const cy = y + height / 2;
  const { dx, dy } = direction;

  // Choose the dominant axis to decide which edge to exit from
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? { x: x + width, y: cy } : { x, y: cy }; // right / left
  }
  return dy >= 0 ? { x: cx, y: y + height } : { x: cx, y }; // bottom / top
}

/**
 * Build a smooth cubic-bezier "S-curve" between two edge ports.
 * Control points are tangent to the exit/entry edge, giving the clean
 * React-Flow–style look.
 */
function sCurvePath(sx: number, sy: number, tx: number, ty: number): string {
  const absDx = Math.abs(tx - sx);
  const absDy = Math.abs(ty - sy);
  const isHorizontal = absDx >= absDy;

  if (isHorizontal) {
    // Horizontal S-curve: CP tangents are purely horizontal
    const offset = Math.max(50, absDx * 0.45);
    const signX = tx >= sx ? 1 : -1;
    return `M ${sx} ${sy} C ${sx + signX * offset} ${sy} ${tx - signX * offset} ${ty} ${tx} ${ty}`;
  }
  // Vertical S-curve: CP tangents are purely vertical
  const offset = Math.max(50, absDy * 0.45);
  const signY = ty >= sy ? 1 : -1;
  return `M ${sx} ${sy} C ${sx} ${sy + signY * offset} ${tx} ${ty - signY * offset} ${tx} ${ty}`;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
  line: '#818cf8',      // indigo-400
  lineDark: '#6366f1',  // indigo-500
  glow: 'rgba(99,102,241,0.15)',
  dim: 'rgba(99,102,241,0.5)',
};

// ─── Component ────────────────────────────────────────────────────────────────

const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  connections,
  components,
  isConnecting,
  connectionStart,
  mousePosition,
  zoom = 1,
}) => {
  // All measurements are in canvas-space (the SVG lives inside the zoomed container).
  // To keep visual sizes constant at any zoom level we divide pixel values by zoom.
  const stroke = 1.5 / zoom;
  const arrowW = 10 / zoom;
  const arrowH = 8 / zoom;
  const glowStroke = 6 / zoom;
  const dashLen = 6 / zoom;
  const dashGap = 4 / zoom;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: '100%', height: '100%', zIndex: 1, overflow: 'visible' }}
    >
      <defs>
        {/* Solid arrowhead */}
        <marker
          id="cline-arrow"
          markerWidth={arrowW}
          markerHeight={arrowH}
          refX={arrowW - stroke}
          refY={arrowH / 2}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d={`M ${stroke} ${stroke * 0.5} L ${arrowW - stroke} ${arrowH / 2} L ${stroke} ${arrowH - stroke * 0.5} Z`}
            fill={COLORS.lineDark}
          />
        </marker>

        {/* Dimmed arrowhead for live preview */}
        <marker
          id="cline-arrow-dim"
          markerWidth={arrowW}
          markerHeight={arrowH}
          refX={arrowW - stroke}
          refY={arrowH / 2}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d={`M ${stroke} ${stroke * 0.5} L ${arrowW - stroke} ${arrowH / 2} L ${stroke} ${arrowH - stroke * 0.5} Z`}
            fill={COLORS.lineDark}
            opacity="0.45"
          />
        </marker>
      </defs>

      {/* ── Established connections ────────────────────────────────────────── */}
      {connections.map((connection) => {
        if (!connection?.source || !connection?.target) return null;

        const fromComp = components.find((c) => c.id === connection.source);
        const toComp = components.find((c) => c.id === connection.target);
        if (!fromComp || !toComp) return null;

        const fromCx = fromComp.position.x + fromComp.size.width / 2;
        const fromCy = fromComp.position.y + fromComp.size.height / 2;
        const toCx = toComp.position.x + toComp.size.width / 2;
        const toCy = toComp.position.y + toComp.size.height / 2;

        const fwd = { dx: toCx - fromCx, dy: toCy - fromCy };
        const bwd = { dx: -fwd.dx, dy: -fwd.dy };

        const src = getPort(fromComp, fwd);
        const tgt = getPort(toComp, bwd);
        const path = sCurvePath(src.x, src.y, tgt.x, tgt.y);

        return (
          <g key={connection.id}>
            {/* Soft glow halo */}
            <path
              d={path}
              stroke={COLORS.glow}
              strokeWidth={glowStroke}
              fill="none"
              strokeLinecap="round"
            />
            {/* Main line */}
            <path
              d={path}
              stroke={COLORS.line}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              markerEnd="url(#cline-arrow)"
            />
            {/* Source port dot */}
            <circle
              cx={src.x}
              cy={src.y}
              r={2.5 / zoom}
              fill={COLORS.lineDark}
            />
          </g>
        );
      })}

      {/* ── Live preview while creating a connection ──────────────────────── */}
      {isConnecting && connectionStart && mousePosition &&
        (() => {
          const startComp = components.find((c) => c.id === connectionStart);
          if (!startComp) return null;

          const fromCx = startComp.position.x + startComp.size.width / 2;
          const fromCy = startComp.position.y + startComp.size.height / 2;
          const dir = {
            dx: mousePosition.x - fromCx,
            dy: mousePosition.y - fromCy,
          };

          const src = getPort(startComp, dir);
          const path = sCurvePath(src.x, src.y, mousePosition.x, mousePosition.y);

          return (
            <g>
              <path
                d={path}
                stroke={COLORS.dim}
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${dashLen} ${dashGap}`}
                markerEnd="url(#cline-arrow-dim)"
              />
              <circle cx={src.x} cy={src.y} r={2.5 / zoom} fill={COLORS.dim} />
            </g>
          );
        })()}
    </svg>
  );
};

export default ConnectionLines;
