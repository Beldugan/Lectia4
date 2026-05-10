import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

function buildGearPath(cx, cy, r, teeth, toothHeight, toothWidth) {
  const points = [];
  const totalPoints = teeth * 4;
  for (let i = 0; i < totalPoints; i++) {
    const angle = (i / totalPoints) * Math.PI * 2;
    const isOuter = i % 4 === 1 || i % 4 === 2;
    const rad = isOuter ? r + toothHeight : r;
    const spread = isOuter ? toothWidth : 1;
    const a = angle + (spread * Math.PI) / totalPoints;
    points.push(`${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`);
  }
  return `M ${points.join(' L ')} Z`;
}

function Gear({ cx, cy, radius, teeth, color, rotationDeg, label, direction }) {
  const toothH = radius * 0.18;
  const toothW = 0.6;
  const path = buildGearPath(cx, cy, radius, teeth, toothH, toothW);

  return (
    <g>
      <motion.g
        style={{ originX: `${cx}px`, originY: `${cy}px` }}
        animate={{ rotate: direction === 'cw' ? rotationDeg : -rotationDeg }}
        transition={{ duration: 0, ease: 'linear' }}
      >
        <path d={path} fill={color} opacity="0.9" />
        <circle cx={cx} cy={cy} r={radius * 0.35} fill="white" opacity="0.9" />
        <circle cx={cx} cy={cy} r={radius * 0.12} fill={color} />
        <line x1={cx - radius * 0.28} y1={cy} x2={cx + radius * 0.28} y2={cy} stroke={color} strokeWidth="3" opacity="0.5" />
        <line x1={cx} y1={cy - radius * 0.28} x2={cx} y2={cy + radius * 0.28} stroke={color} strokeWidth="3" opacity="0.5" />
      </motion.g>
      <text x={cx} y={cy + radius + toothH + 18} textAnchor="middle" fontSize="13" fill="#6B7280" fontWeight="500">
        {label}
      </text>
    </g>
  );
}

export default function GearAnimation() {
  const [isRunning, setIsRunning] = useState(false);
  const [rpm, setRpm] = useState(1);
  const [teethLarge, setTeethLarge] = useState(20);
  const [teethSmall, setTeethSmall] = useState(10);
  const [largeDeg, setLargeDeg] = useState(0);
  const [smallDeg, setSmallDeg] = useState(0);
  const [rotationsLarge, setRotationsLarge] = useState(0);
  const [rotationsSmall, setRotationsSmall] = useState(0);

  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const largeAccRef = useRef(0);
  const smallAccRef = useRef(0);

  const ratio = teethLarge / teethSmall;

  const animate = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const degreesPerSec = rpm * 6;
    const largeDelta = degreesPerSec * delta;
    const smallDelta = largeDelta * ratio;

    largeAccRef.current += largeDelta;
    smallAccRef.current += smallDelta;

    setLargeDeg(largeAccRef.current % 360);
    setSmallDeg(smallAccRef.current % 360);
    setRotationsLarge(+(largeAccRef.current / 360).toFixed(2));
    setRotationsSmall(+(smallAccRef.current / 360).toFixed(2));

    rafRef.current = requestAnimationFrame(animate);
  }, [rpm, ratio]);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, animate]);

  const handleReset = () => {
    setIsRunning(false);
    cancelAnimationFrame(rafRef.current);
    largeAccRef.current = 0;
    smallAccRef.current = 0;
    setLargeDeg(0);
    setSmallDeg(0);
    setRotationsLarge(0);
    setRotationsSmall(0);
  };

  const rLarge = 80;
  const rSmall = rLarge * (teethSmall / teethLarge);
  const cx1 = 140;
  const cy1 = 160;
  const gap = 8;
  const cx2 = cx1 + rLarge + rSmall + gap;
  const cy2 = cy1;

  const ratioText = ratio >= 1
    ? `1 : ${ratio.toFixed(1).replace('.0', '')}`
    : `${(1 / ratio).toFixed(1).replace('.0', '')} : 1`;

  return (
    <div>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1F2937', marginBottom: '6px' }}>
          ⚙️ Angrenaje — Cum colaborează roțile dințate?
        </h2>
        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '24px' }}>
          Roata mare pune în mișcare roata mică → mica se rotește <strong>mai repede</strong> dar cu <strong>mai puțină forță</strong>.
        </p>

        {/* SVG Canvas */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="420" height="280" viewBox="0 0 420 280" style={{ overflow: 'visible' }}>
            {/* Connection line */}
            <line
              x1={cx1 + rLarge + 4}
              y1={cy1}
              x2={cx2 - rSmall - 4}
              y2={cy2}
              stroke="#D1D5DB"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            <Gear
              cx={cx1} cy={cy1}
              radius={rLarge}
              teeth={teethLarge}
              color="#8B5CF6"
              rotationDeg={largeDeg}
              direction="cw"
              label={`Roata MARE (${teethLarge} dințî)`}
            />
            <Gear
              cx={cx2} cy={cy2}
              radius={rSmall}
              teeth={teethSmall}
              color="#EC4899"
              rotationDeg={smallDeg}
              direction="ccw"
              label={`Roata MICĂ (${teethSmall} dințî)`}
            />

            {/* Labels */}
            <text x={cx1} y={cy1 - rLarge - 14} textAnchor="middle" fontSize="12" fill="#8B5CF6" fontWeight="700">
              {rotationsLarge.toFixed(1)} rot.
            </text>
            <text x={cx2} y={cy2 - rSmall - 14} textAnchor="middle" fontSize="12" fill="#EC4899" fontWeight="700">
              {rotationsSmall.toFixed(1)} rot.
            </text>
          </svg>
        </div>

        {/* Raport info */}
        <div style={{
          backgroundColor: '#F5F3FF',
          border: '2px solid #8B5CF6',
          borderRadius: '12px',
          padding: '14px 20px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#7C3AED' }}>
            📊 Raport: {ratioText} — mica face {ratio.toFixed(1)} rotații la 1 rotație a celei mari
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
              Viteză roată mare: <span style={{ color: '#8B5CF6' }}>{rpm} RPM</span>
            </label>
            <input
              type="range" min="0.5" max="3" step="0.5" value={rpm}
              onChange={e => setRpm(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
              Dințî roată mare: <span style={{ color: '#8B5CF6' }}>{teethLarge}</span>
            </label>
            <input
              type="range" min="10" max="30" step="1" value={teethLarge}
              onChange={e => { handleReset(); setTeethLarge(Number(e.target.value)); }}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
              Dințî roată mică: <span style={{ color: '#EC4899' }}>{teethSmall}</span>
            </label>
            <input
              type="range" min="5" max="20" step="1" value={teethSmall}
              onChange={e => { handleReset(); setTeethSmall(Number(e.target.value)); }}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsRunning(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px',
              backgroundColor: isRunning ? '#F59E0B' : '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '48px',
            }}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
            {isRunning ? 'Pauză' : 'Pornește'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '48px',
            }}
          >
            <RotateCcw size={20} />
            Reset
          </motion.button>
        </div>
      </div>

      {/* Info card */}
      <div style={{
        backgroundColor: '#EFF6FF',
        borderRadius: '12px',
        padding: '16px 20px',
        borderLeft: '4px solid #3B82F6',
      }}>
        <p style={{ fontSize: '15px', color: '#1D4ED8', fontWeight: '500' }}>
          💡 <strong>Știai că?</strong> La ceasuri, roțile dințate controlează mișcarea acelor!
          O roată mică și rapidă învârtește una mare și lentă — de aceea secundarul merge mai repede decât orarul.
        </p>
      </div>
    </div>
  );
}
