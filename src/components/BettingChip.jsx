import React from 'react';

/**
 * BettingChip Component
 * A reusable, visually enhanced casino chip with 3D effects
 *
 * @param {number} value - The chip value (e.g., 5, 10, 25, 100)
 * @param {string} color - The chip color (gold, red, blue, green, black)
 * @param {function} onClick - Click handler
 * @param {string} size - Size variant (sm, md, lg)
 * @param {boolean} disabled - Disabled state
 */
function BettingChip({
  value,
  color = 'gold',
  onClick,
  size = 'md',
  disabled = false,
  className = ''
}) {

  const colorMap = {
    gold: {
      bg: 'linear-gradient(145deg, #f4c430 0%, #d4a017 100%)',
      border: '#d4a017',
      text: '#000000'
    },
    red: {
      bg: 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)',
      border: '#991b1b',
      text: '#ffffff'
    },
    blue: {
      bg: 'linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)',
      border: '#1e3a8a',
      text: '#ffffff'
    },
    green: {
      bg: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
      border: '#065f46',
      text: '#ffffff'
    },
    black: {
      bg: 'linear-gradient(145deg, #1f2937 0%, #111827 100%)',
      border: '#000000',
      text: '#ffffff'
    }
  };

  const sizeMap = {
    sm: { width: '48px', height: '48px', fontSize: '14px' },
    md: { width: '64px', height: '64px', fontSize: '18px' },
    lg: { width: '80px', height: '80px', fontSize: '24px' }
  };

  const chipColor = colorMap[color] || colorMap.gold;
  const chipSize = sizeMap[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`chip-glow ${className}`}
      style={{
        width: chipSize.width,
        height: chipSize.height,
        background: chipColor.bg,
        border: `3px solid ${chipColor.border}`,
        color: chipColor.text,
        fontSize: chipSize.fontSize,
        fontWeight: '800',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Montserrat, sans-serif',
        letterSpacing: '-0.02em',
        userSelect: 'none',
      }}
    >
      {/* Outer ring pattern */}
      <div
        style={{
          position: 'absolute',
          inset: '6px',
          border: `2px dashed ${chipColor.text}`,
          borderRadius: '50%',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      {/* Value */}
      <span style={{ position: 'relative', zIndex: 2 }}>
        {value}
      </span>
    </button>
  );
}

/**
 * ChipStack Component
 * Displays a stack of chips
 */
export function ChipStack({ chips = [], onClick }) {
  return (
    <div className="chip-stack" style={{ display: 'inline-flex', flexDirection: 'column-reverse', alignItems: 'center' }}>
      {chips.map((chip, index) => (
        <div
          key={index}
          style={{
            marginTop: index > 0 ? '-10px' : '0',
            zIndex: chips.length - index,
          }}
        >
          <BettingChip {...chip} onClick={() => onClick?.(chip, index)} />
        </div>
      ))}
    </div>
  );
}

export default BettingChip;
