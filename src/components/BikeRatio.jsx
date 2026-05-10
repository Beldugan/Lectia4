import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const SPEEDS = [
  { id: 1, label: 'Viteza 1 (urcuș)', ratio: 1, desc: 'perfect pentru deal', color: '#10B981', emoji: '⛰️' },
  { id: 2, label: 'Viteza 3 (normal)', ratio: 3, desc: 'perfect pentru șosea', color: '#3B82F6', emoji: '🛣️' },
  { id: 3, label: 'Viteza 7 (coborâre)', ratio: 7, desc: 'perfect pentru coborâre', color: '#EF4444', emoji: '🏔️' },
];

const WHEEL_CIRCUM = 2;

// Gear path built around (cx, cy) — rotated via SVG transform
function buildGearPath(cx, cy, r, teeth) {
  const toothH = r * 0.22;
  const toothW = 0.55;
  const totalPoints = teeth * 4;
  const points = [];
  for (let i = 0; i < totalPoints; i++) {
    const angle = (i / totalPoints) * Math.PI * 2;
    const isOuter = i % 4 === 1 || i % 4 === 2;
    const rad = isOuter ? r + toothH : r;
    const spread = isOuter ? toothW : 1;
    const a = angle + (spread * Math.PI) / totalPoints;
    points.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  return `M ${points.map(p => p.join(',')).join(' L ')} Z`;
}

export default function BikeRatio() {
  const [speedIdx, setSpeedIdx] = useState(1);
  const [pedals, setPedals] = useState(1);
  const [pedalRot, setPedalRot] = useState(0);
  const [dashOffset, setDashOffset] = useState(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const pedalAccRef = useRef(0);

  const speed = SPEEDS[speedIdx];
  const rearRotations = pedals * speed.ratio;
  const distance = (rearRotations * WHEEL_CIRCUM).toFixed(1);

  const rSmall = 30;
  // Rear sprocket: physically larger for lower gears (more teeth = more force advantage)
  const rLarge = Math.min(24 + speed.ratio * 6, 58);

  const cx1 = 100, cy1 = 160; // front (pedal) sprocket
  const cx2 = 310, cy2 = 160; // rear sprocket

  // Chain path: approximate external tangent
  const dy_top = (cy2 - rLarge) - (cy1 - rSmall); // negative = right top is higher
  const dy_bot = (cy2 + rLarge) - (cy1 + rSmall);
  const chainPath = [
    `M ${cx1} ${cy1 - rSmall}`,
    `L ${cx2} ${cy2 - rLarge}`,
    `A ${rLarge} ${rLarge} 0 0 1 ${cx2} ${cy2 + rLarge}`,
    `L ${cx1} ${cy1 + rSmall}`,
    `A ${rSmall} ${rSmall} 0 0 1 ${cx1} ${cy1 - rSmall}`,
    'Z',
  ].join(' ');

  // Approximate chain circumference for dash animation
  const topLen = Math.sqrt((cx2 - cx1) ** 2 + dy_top ** 2);
  const botLen = Math.sqrt((cx2 - cx1) ** 2 + dy_bot ** 2);
  const chainLen = topLen + botLen + Math.PI * rLarge + Math.PI * rSmall;

  useEffect(() => {
    const animate = (ts) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      pedalAccRef.current = (pedalAccRef.current + 60 * dt) % 360;
      setPedalRot(pedalAccRef.current);
      setDashOffset(prev => prev - dt * 80);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const rearDeg = pedalRot * speed.ratio;

  const handleSpeedChange = (i) => {
    setSpeedIdx(i);
    pedalAccRef.current = 0;
    setPedalRot(0);
    setDashOffset(0);
  };

  return (
    <div>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1F2937', marginBottom: '6px' }}>
          🚲 Bicicleta — De ce sunt vitezele utile?
        </h2>
        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '24px' }}>
          Pedalele fac X rotații → roata din spate face Y rotații. Bicicleta amplifică efortul tău!
        </p>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* SVG */}
          <div style={{ flex: '0 0 auto' }}>
            <svg width="430" height="300" style={{ border: '2px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB' }}>
              {/* Ground */}
              <rect x="40" y="260" width="350" height="8" rx="4" fill="#D1D5DB" />

              {/* Chain background (thick outline) */}
              <path d={chainPath} fill="none" stroke="#D97706" strokeWidth={8} opacity="0.25" />

              {/* Chain animated (dashes moving) */}
              <path
                d={chainPath}
                fill="none"
                stroke="#78350F"
                strokeWidth={5}
                strokeDasharray="10 6"
                strokeDashoffset={dashOffset}
              />

              {/* Rear sprocket (large, green) */}
              <g transform={`rotate(${rearDeg}, ${cx2}, ${cy2})`}>
                <path d={buildGearPath(cx2, cy2, rLarge, 16)} fill="#10B981" opacity="0.9" />
                <circle cx={cx2} cy={cy2} r={rLarge * 0.38} fill="white" opacity="0.9" />
                <circle cx={cx2} cy={cy2} r={rLarge * 0.13} fill="#065F46" />
                <line x1={cx2 - rLarge * 0.3} y1={cy2} x2={cx2 + rLarge * 0.3} y2={cy2} stroke="#065F46" strokeWidth="3" opacity="0.5" />
                <line x1={cx2} y1={cy2 - rLarge * 0.3} x2={cx2} y2={cy2 + rLarge * 0.3} stroke="#065F46" strokeWidth="3" opacity="0.5" />
              </g>

              {/* Front sprocket (small, purple) with pedal arm */}
              <g transform={`rotate(${pedalRot}, ${cx1}, ${cy1})`}>
                <path d={buildGearPath(cx1, cy1, rSmall, 10)} fill="#8B5CF6" opacity="0.9" />
                <circle cx={cx1} cy={cy1} r={rSmall * 0.38} fill="white" opacity="0.9" />
                <circle cx={cx1} cy={cy1} r={rSmall * 0.14} fill="#6D28D9" />
                {/* Pedal arm (relative to center, rotates with group) */}
                <line x1={cx1} y1={cy1} x2={cx1 + rSmall * 0.75} y2={cy1} stroke="#6D28D9" strokeWidth="4" strokeLinecap="round" />
                <circle cx={cx1 + rSmall * 0.75} cy={cy1} r={5} fill="#1F2937" />
                <line x1={cx1} y1={cy1} x2={cx1 - rSmall * 0.75} y2={cy1} stroke="#6D28D9" strokeWidth="4" strokeLinecap="round" />
                <circle cx={cx1 - rSmall * 0.75} cy={cy1} r={5} fill="#1F2937" />
              </g>

              {/* Labels */}
              <text x={cx1} y={cy1 + rSmall + 22} textAnchor="middle" fontSize="12" fill="#6B7280" fontWeight="600">pedale (mică)</text>
              <text x={cx2} y={cy2 + rLarge + 22} textAnchor="middle" fontSize="12" fill="#6B7280" fontWeight="600">roata spate (mare)</text>

              {/* Rotation speed labels */}
              <text x={cx1} y={cy1 - rSmall - 14} textAnchor="middle" fontSize="12" fill="#8B5CF6" fontWeight="700">×1</text>
              <text x={cx2} y={cy2 - rLarge - 14} textAnchor="middle" fontSize="12" fill="#10B981" fontWeight="700">×{speed.ratio}</text>
            </svg>
          </div>

          {/* Controls */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              Selectează viteza:
            </p>
            {SPEEDS.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => handleSpeedChange(i)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 16px', marginBottom: '10px', borderRadius: '12px',
                  border: speedIdx === i ? `2px solid ${s.color}` : '2px solid #E5E7EB',
                  backgroundColor: speedIdx === i ? `${s.color}15` : 'white', cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '15px', color: speedIdx === i ? s.color : '#1F2937' }}>
                  {speedIdx === i ? '●' : '○'} {s.label}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '3px' }}>
                  pedale × 1 = roată × {s.ratio}
                </div>
              </motion.button>
            ))}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Tu pedalezi: <span style={{ color: '#8B5CF6' }}>{pedals} rotații</span>
              </label>
              <input type="range" min="0" max="5" step="0.5" value={pedals}
                onChange={e => setPedals(Number(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div style={{ backgroundColor: `${speed.color}15`, border: `2px solid ${speed.color}`, borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: speed.color, marginBottom: '6px' }}>
                {speed.emoji} {speed.desc}
              </div>
              <div style={{ fontSize: '15px', color: '#374151', fontFamily: 'monospace', lineHeight: '1.8' }}>
                🦵 Pedale: <strong>{pedals}</strong> rotații<br />
                🔄 Roata spate: <strong>{rearRotations.toFixed(1)}</strong> rotații<br />
                🛣️ Distanță: <strong>~{distance} m</strong>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFBEB', border: '2px solid #F59E0B', borderRadius: '12px', padding: '14px' }}>
              <p style={{ fontSize: '14px', color: '#92400E', lineHeight: '1.6' }}>
                💡 La <strong>urcuș</strong>: viteză mică → pedalezi ușor dar faci puțini metri.<br />
                La <strong>coborâre</strong>: viteză mare → o pedalare = distanță mare!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '16px 20px', borderLeft: '4px solid #3B82F6' }}>
        <p style={{ fontSize: '15px', color: '#1D4ED8', fontWeight: '500' }}>
          💡 <strong>Știai că?</strong> Angrenajele bicicletei funcționează exact ca roțile dințate din Modulul 1 — roata mică a pedalelor pune în mișcare roata mare a spatelui prin lanț!
        </p>
      </div>
    </div>
  );
}
