import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const SPEEDS = [
  { id: 1, label: 'Viteza 1 (urcuș)', ratio: 1, desc: 'perfect pentru deal', color: '#10B981', emoji: '⛰️' },
  { id: 2, label: 'Viteza 3 (normal)', ratio: 3, desc: 'perfect pentru șosea', color: '#3B82F6', emoji: '🛣️' },
  { id: 3, label: 'Viteza 7 (coborâre)', ratio: 7, desc: 'perfect pentru coborâre', color: '#EF4444', emoji: '🏔️' },
];

const WHEEL_CIRCUM = 2;

function buildGearPath(cx, cy, r, teeth) {
  const toothH = r * 0.2;
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

function ChainDot({ progress, x1, y1, x2, y2, r1, r2 }) {
  const totalLen = (x2 - x1) * 2 + Math.PI * (r1 + r2);
  const topLen = x2 - x1;
  const t = progress % 1;
  const dist = t * totalLen;

  let x, y;
  if (dist < topLen) {
    x = x1 + dist;
    y = y1 - r1;
  } else if (dist < topLen + Math.PI * r2) {
    const a = ((dist - topLen) / r2) - Math.PI / 2;
    x = x2 + Math.cos(a) * r2;
    y = y2 + Math.sin(a) * r2;
  } else if (dist < topLen * 2 + Math.PI * r2) {
    const d2 = dist - topLen - Math.PI * r2;
    x = x2 - d2;
    y = y2 + r2;
  } else {
    const d3 = dist - topLen * 2 - Math.PI * r2;
    const a = Math.PI + (d3 / r1) - Math.PI / 2;
    x = x1 + Math.cos(a) * r1;
    y = y1 + Math.sin(a) * r1;
  }
  return <circle cx={x} cy={y} r={4} fill="#78350F" opacity="0.85" />;
}

export default function BikeRatio() {
  const [speedIdx, setSpeedIdx] = useState(1);
  const [pedalRot, setPedalRot] = useState(0);
  const [pedals, setPedals] = useState(1);
  const [chainOffset, setChainOffset] = useState(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const rotRef = useRef(0);

  const speed = SPEEDS[speedIdx];
  const rearRotations = pedals * speed.ratio;
  const distance = (rearRotations * WHEEL_CIRCUM).toFixed(1);

  const rSmall = 32;
  const rLarge = rSmall * speed.ratio * 0.5 + 20;
  const rLargeCapped = Math.min(rLarge, 62);

  const cx1 = 90, cy1 = 160;
  const cx2 = 300, cy2 = 160;

  useEffect(() => {
    const animate = (ts) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      rotRef.current += 60 * dt;
      setPedalRot(rotRef.current % 360);
      setChainOffset(o => (o + dt * 0.25) % 1);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const rearDeg = pedalRot * speed.ratio;

  const CHAIN_DOTS = 12;

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
          🚲 Bicicleta — De ce sunt vitezele utile?
        </h2>
        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '24px' }}>
          Pedalele fac X rotații → roata din spate face Y rotații. Bicicleta amplifică efortul tău!
        </p>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* SVG animation */}
          <div style={{ flex: '0 0 auto' }}>
            <svg width="420" height="280" style={{ border: '2px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB' }}>
              {/* Ground */}
              <rect x="40" y="230" width="340" height="8" rx="4" fill="#D1D5DB" />

              {/* Chain - background lines */}
              <line x1={cx1} y1={cy1 - rSmall} x2={cx2} y2={cy2 - rLargeCapped} stroke="#92400E" strokeWidth="6" opacity="0.3" />
              <line x1={cx1} y1={cy1 + rSmall} x2={cx2} y2={cy2 + rLargeCapped} stroke="#92400E" strokeWidth="6" opacity="0.3" />

              {/* Chain dots */}
              {Array.from({ length: CHAIN_DOTS }, (_, i) => (
                <ChainDot
                  key={i}
                  progress={(chainOffset + i / CHAIN_DOTS) % 1}
                  x1={cx1} y1={cy1}
                  x2={cx2} y2={cy2}
                  r1={rSmall} r2={rLargeCapped}
                />
              ))}

              {/* Rear gear (large) */}
              <motion.g style={{ originX: `${cx2}px`, originY: `${cy2}px` }}
                animate={{ rotate: rearDeg }}
                transition={{ duration: 0, ease: 'linear' }}>
                <path d={buildGearPath(cx2, cy2, rLargeCapped, 18)} fill="#10B981" opacity="0.85" />
                <circle cx={cx2} cy={cy2} r={rLargeCapped * 0.38} fill="white" opacity="0.9" />
                <circle cx={cx2} cy={cy2} r={rLargeCapped * 0.12} fill="#065F46" />
              </motion.g>

              {/* Pedal gear (small) */}
              <motion.g style={{ originX: `${cx1}px`, originY: `${cy1}px` }}
                animate={{ rotate: pedalRot }}
                transition={{ duration: 0, ease: 'linear' }}>
                <path d={buildGearPath(cx1, cy1, rSmall, 10)} fill="#8B5CF6" opacity="0.9" />
                <circle cx={cx1} cy={cy1} r={rSmall * 0.38} fill="white" opacity="0.9" />
                <circle cx={cx1} cy={cy1} r={rSmall * 0.14} fill="#6D28D9" />
                {/* Pedal arm */}
                <line x1={cx1} y1={cy1} x2={cx1 + rSmall * 0.7 * Math.cos((pedalRot * Math.PI) / 180)} y2={cy1 + rSmall * 0.7 * Math.sin((pedalRot * Math.PI) / 180)} stroke="#6D28D9" strokeWidth="4" />
                <circle cx={cx1 + rSmall * 0.7 * Math.cos((pedalRot * Math.PI) / 180)} cy={cy1 + rSmall * 0.7 * Math.sin((pedalRot * Math.PI) / 180)} r={5} fill="#374151" />
              </motion.g>

              {/* Labels */}
              <text x={cx1} y={cy1 + rSmall + 22} textAnchor="middle" fontSize="12" fill="#6B7280" fontWeight="600">pedale</text>
              <text x={cx1} y={cy1 + rSmall + 36} textAnchor="middle" fontSize="11" fill="#8B5CF6">(mică)</text>
              <text x={cx2} y={cy2 + rLargeCapped + 22} textAnchor="middle" fontSize="12" fill="#6B7280" fontWeight="600">roata spate</text>
              <text x={cx2} y={cy2 + rLargeCapped + 36} textAnchor="middle" fontSize="11" fill="#10B981">(mare)</text>

              {/* Rotation indicators */}
              <text x={cx1} y={cy1 - rSmall - 14} textAnchor="middle" fontSize="11" fill="#8B5CF6" fontWeight="700">
                ×1
              </text>
              <text x={cx2} y={cy2 - rLargeCapped - 14} textAnchor="middle" fontSize="11" fill="#10B981" fontWeight="700">
                ×{speed.ratio}
              </text>
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
                onClick={() => setSpeedIdx(i)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  marginBottom: '10px',
                  borderRadius: '12px',
                  border: speedIdx === i ? `2px solid ${s.color}` : '2px solid #E5E7EB',
                  backgroundColor: speedIdx === i ? `${s.color}15` : 'white',
                  cursor: 'pointer',
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

            {/* Pedal slider */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Tu pedalezi: <span style={{ color: '#8B5CF6' }}>{pedals} rotații</span>
              </label>
              <input
                type="range" min="0" max="5" step="0.5" value={pedals}
                onChange={e => setPedals(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Info box */}
            <div style={{
              backgroundColor: `${speed.color}15`,
              border: `2px solid ${speed.color}`,
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: speed.color, marginBottom: '6px' }}>
                {speed.emoji} {speed.desc}
              </div>
              <div style={{ fontSize: '15px', color: '#374151', fontFamily: 'monospace', lineHeight: '1.8' }}>
                🦵 Pedale: <strong>{pedals}</strong> rotații<br />
                🔄 Roata spate: <strong>{rearRotations.toFixed(1)}</strong> rotații<br />
                🛣️ Distanță: <strong>~{distance} m</strong>
              </div>
            </div>

            <div style={{
              backgroundColor: '#FFFBEB',
              border: '2px solid #F59E0B',
              borderRadius: '12px',
              padding: '14px',
            }}>
              <p style={{ fontSize: '14px', color: '#92400E', lineHeight: '1.6' }}>
                💡 La <strong>urcuș</strong> alegi viteză MICĂ → pedalezi mult dar cu efort puțin.
                La <strong>coborâre</strong> alegi viteză MARE → fiecare pedalare = distanță mare!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#EFF6FF',
        borderRadius: '12px',
        padding: '16px 20px',
        borderLeft: '4px solid #3B82F6',
      }}>
        <p style={{ fontSize: '15px', color: '#1D4ED8', fontWeight: '500' }}>
          💡 <strong>Știai că?</strong> Angrenajele bicicletei funcționează exact ca roțile dințate din Modulul 1!
          Roata mică a pedalelor pune în mișcare roata mare a spatelui.
        </p>
      </div>
    </div>
  );
}
