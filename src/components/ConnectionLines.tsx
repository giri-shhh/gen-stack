import React from 'react';
import { getConnectionTypeConfig } from '../data/connectionTypes';
import type { ConnectionLinesProps } from '../types';

// ─── Geometry helpers ────────────────────────────────────────────────────────

/** Pick the edge mid-point of `comp` that faces `direction`. */
function getPort(comp: any, direction: { dx: number; dy: number }) {
  const { x, y, width, height } = {
    x: comp.position.x,
    y: comp.position.y,
    width: comp.size.width,
    height: comp.size.height,
  };
  const cx = x + width / 2;
  const cy = y + height / 2;
  const { dx, dy } = direction;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? { x: x + width, y: cy } : { x, y: cy };
  }
  return dy >= 0 ? { x: cx, y: y + height } : { x: cx, y };
}

/** Build a smooth S-curve cubic bezier string between two ports. */
function sCurvePath(sx: number, sy: number, tx: number, ty: number): string {
  const absDx = Math.abs(tx - sx);
  const absDy = Math.abs(ty - sy);
  if (absDx >= absDy) {
    const offset = Math.max(50, absDx * 0.45);
    const sign = tx >= sx ? 1 : -1;
    return `M ${sx} ${sy} C ${sx + sign * offset} ${sy} ${tx - sign * offset} ${ty} ${tx} ${ty}`;
  }
  const offset = Math.max(50, absDy * 0.45);
  const sign = ty >= sy ? 1 : -1;
  return `M ${sx} ${sy} C ${sx} ${sy + sign * offset} ${tx} ${ty - sign * offset} ${tx} ${ty}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  connections,
  components,
  isConnecting,
  connectionStart,
  mousePosition,
  zoom = 1,
  selectedConnectionId,
  onConnectionClick,
}) => {
  // Keep visual sizes constant at all zoom levels (SVG lives inside the zoomed canvas)
  const stroke = 1.5 / zoom;
  const selectedStroke = 2.5 / zoom;
  const glowStroke = 7 / zoom;
  const hitArea = 12 / zoom;
  const arrowW = 10 / zoom;
  const arrowH = 8 / zoom;
  const dotR = 2.5 / zoom;
  const labelFontSize = 9 / zoom;
  const labelPaddingX = 6 / zoom;
  const labelPaddingY = 3 / zoom;
  const labelHeight = (labelFontSize + labelPaddingY * 2);
  const dashLen = 6 / zoom;
  const dashGap = 4 / zoom;

  // Build per-type marker IDs so each type can have its own color
  const markerDefs = connections.reduce<Set<string>>((acc, conn) => {
    const cfg = getConnectionTypeConfig(conn.connectionType);
    acc.add(cfg.color);
    return acc;
  }, new Set());

  return (
    <svg
      className="absolute top-0 left-0"
      style={{ width: '100%', height: '100%', zIndex: 1, overflow: 'visible' }}
    >
      <defs>
        {/* Per-color arrowhead markers */}
        {Array.from(markerDefs).map((color) => {
          const id = `arrow-${color.replace('#', '')}`;
          const idSel = `arrow-sel-${color.replace('#', '')}`;
          return (
            <React.Fragment key={color}>
              <marker id={id} markerWidth={arrowW} markerHeight={arrowH}
                refX={arrowW - stroke} refY={arrowH / 2}
                orient="auto" markerUnits="userSpaceOnUse">
                <path
                  d={`M ${stroke} ${stroke * 0.5} L ${arrowW - stroke} ${arrowH / 2} L ${stroke} ${arrowH - stroke * 0.5} Z`}
                  fill={color}
                />
              </marker>
              {/* Selected / highlighted version */}
              <marker id={idSel} markerWidth={arrowW * 1.2} markerHeight={arrowH * 1.2}
                refX={(arrowW * 1.2) - selectedStroke} refY={(arrowH * 1.2) / 2}
                orient="auto" markerUnits="userSpaceOnUse">
                <path
                  d={`M ${selectedStroke} ${selectedStroke * 0.5} L ${arrowW * 1.2 - selectedStroke} ${(arrowH * 1.2) / 2} L ${selectedStroke} ${arrowH * 1.2 - selectedStroke * 0.5} Z`}
                  fill={color}
                />
              </marker>
            </React.Fragment>
          );
        })}

        {/* Live-preview arrowhead (dimmed) */}
        <marker id="arrow-preview" markerWidth={arrowW} markerHeight={arrowH}
          refX={arrowW - stroke} refY={arrowH / 2}
          orient="auto" markerUnits="userSpaceOnUse">
          <path
            d={`M ${stroke} ${stroke * 0.5} L ${arrowW - stroke} ${arrowH / 2} L ${stroke} ${arrowH - stroke * 0.5} Z`}
            fill="#6366f1" opacity="0.45"
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
        const src = getPort(fromComp, fwd);
        const tgt = getPort(toComp, { dx: -fwd.dx, dy: -fwd.dy });
        const path = sCurvePath(src.x, src.y, tgt.x, tgt.y);

        const cfg = getConnectionTypeConfig(connection.connectionType);
        const isSelected = connection.id === selectedConnectionId;
        const isConfigured = !!connection.connectionType;

        const markerId = `arrow-${cfg.color.replace('#', '')}`;
        const markerIdSel = `arrow-sel-${cfg.color.replace('#', '')}`;
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;

        // Label text: custom label > type abbreviation (only when type is set)
        const labelText = connection.label || (isConfigured ? cfg.short : null);
        const labelWidth = labelText
          ? labelText.length * (labelFontSize * 0.62) + labelPaddingX * 2
          : 0;

        return (
          <g
            key={connection.id}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onConnectionClick?.(connection.id);
            }}
          >
            {/* Invisible wide hit area for easy clicking */}
            <path
              d={path}
              stroke="transparent"
              strokeWidth={hitArea}
              fill="none"
            />

            {/* Glow halo (stronger when selected) */}
            <path
              d={path}
              stroke={cfg.color}
              strokeWidth={isSelected ? glowStroke * 1.4 : glowStroke}
              fill="none"
              opacity={isSelected ? 0.25 : 0.12}
              strokeLinecap="round"
            />

            {/* Main line */}
            <path
              d={path}
              stroke={cfg.color}
              strokeWidth={isSelected ? selectedStroke : stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={cfg.dasharray ? cfg.dasharray.split(' ').map(v => Number(v) / zoom).join(' ') : undefined}
              markerEnd={`url(#${isSelected ? markerIdSel : markerId})`}
            />

            {/* Source port dot */}
            <circle cx={src.x} cy={src.y} r={dotR} fill={cfg.color} />

            {/* Type / label pill (shown when connection has been configured or has a label) */}
            {labelText && (
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x={-labelWidth / 2}
                  y={-labelHeight / 2}
                  width={labelWidth}
                  height={labelHeight}
                  rx={labelHeight / 2}
                  ry={labelHeight / 2}
                  fill={isSelected ? cfg.color : `${cfg.color}18`}
                  stroke={cfg.color}
                  strokeWidth={0.5 / zoom}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={labelFontSize}
                  fill={isSelected ? '#ffffff' : cfg.color}
                  fontWeight="700"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {labelText}
                </text>
              </g>
            )}

            {/* "Click to configure" indicator for unconfigured connections */}
            {!isConfigured && isSelected && (
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x={-24 / zoom} y={-8 / zoom}
                  width={48 / zoom} height={16 / zoom}
                  rx={8 / zoom} ry={8 / zoom}
                  fill="#1e1b4b" opacity="0.85"
                />
                <text
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={7 / zoom} fill="#e0e7ff"
                  fontWeight="600"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  click to configure
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* ── Live connecting preview ────────────────────────────────────────── */}
      {isConnecting && connectionStart && mousePosition &&
        (() => {
          const startComp = components.find((c) => c.id === connectionStart);
          if (!startComp) return null;
          const fromCx = startComp.position.x + startComp.size.width / 2;
          const fromCy = startComp.position.y + startComp.size.height / 2;
          const dir = { dx: mousePosition.x - fromCx, dy: mousePosition.y - fromCy };
          const src = getPort(startComp, dir);
          const path = sCurvePath(src.x, src.y, mousePosition.x, mousePosition.y);
          return (
            <g style={{ pointerEvents: 'none' }}>
              <path
                d={path}
                stroke="#6366f1"
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${dashLen} ${dashGap}`}
                opacity={0.55}
                markerEnd="url(#arrow-preview)"
              />
              <circle cx={src.x} cy={src.y} r={dotR} fill="#6366f1" opacity={0.5} />
            </g>
          );
        })()}
    </svg>
  );
};

export default ConnectionLines;
