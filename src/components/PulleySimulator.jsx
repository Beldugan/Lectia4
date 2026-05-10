import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const PULLEY_CX = 200;
const PULLEY_CY = 60;
const PULLEY_R = 28;
const ROPE_LEFT_X = PULLEY_CX - PULLEY_R;
const ROPE_RIGHT_X = PULLEY_CX + PULLEY_R;
const CANVAS_HEIGHT = 380;
const BOX_H = 54;
const BOX_W = 60;
const MAX_LIFT = CANVAS_HEIGHT - 100 - BOX_H;
const MIN_OBJ_Y = PULLEY_CY + PULLEY_R + 10;

const MODES = [
  { id: 1, label: '1 scripete', sub: 'Schimbă direcția, aceeași forță', factor: 1 },
  { id: 2, label: '2 scripete', sub: 'Jumătate din forță necesară', factor: 2 },
  { id: 4, label: '4 scripete', sub: 'Un sfert din forță necesară', factor: 4 },
];

export default function PulleySimulator() {
  const [mode, setMode] = useState(1);
  const [lift, setLift] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const svgRef = useRef(null);
  const dragStartY = useRef(null);
  const liftStartRef = useRef(0);

  const objectY = CANVAS_HEIGHT - 80 - BOX_H - lift;
  const lifted = lift;
  const maxLift = MAX_LIFT;
  const liftPct = Math.min(lift / maxLift, 1);

  const weightN = 50;
  const forceN = +(weightN / mode).toFixed(1);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    dragStartY.current = e.clientY ?? e.touches?.[0]?.clientY;
    liftStartRef.current = lift;
  }, [lift]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const dy = dragStartY.current - clientY;
    const newLift = Math.max(0, Math.min(maxLift, liftStartRef.current + dy));
    setLift(newLift);
    if (newLift >= maxLift * 0.95) setCelebrated(true);
  }, [dragging, maxLift]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  const handleReset = () => {
    setLift(0);
    setCelebrated(false);
  };

  const handleModeChange = (m) => {
    setMode(m);
    handleReset();
  };

  const ropeHandleY = CANVAS_HEIGHT - 80 - (lift * 0.6);
  const ropeHandleY_clamped = Math.max(PULLEY_CY + PULLEY_R + 20, Math.min(CANVAS_HEIGHT - 30, ropeHandleY));

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
          🪣 Scripete — Trage sfoara, ridică obiectul!
        </h2>
        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '24px' }}>
          Tragi în <strong>JOS</strong> → obiectul se ridică în <strong>SUS</strong>. Scripetele schimbă direcția forței!
        </p>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* SVG */}
          <div style={{ flex: '0 0 auto' }}>
            <svg
              ref={svgRef}
              width="400"
              height={CANVAS_HEIGHT}
              style={{ border: '2px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB', touchAction: 'none' }}
            >
              {/* Ceiling bar */}
              <rect x="60" y="20" width="280" height="14" rx="7" fill="#374151" />

              {/* Pulley wheel */}
              <circle cx={PULLEY_CX} cy={PULLEY_CY} r={PULLEY_R} fill="#6B7280" />
              <circle cx={PULLEY_CX} cy={PULLEY_CY} r={PULLEY_R - 8} fill="#D1D5DB" />
              <circle cx={PULLEY_CX} cy={PULLEY_CY} r={6} fill="#374151" />

              {/* Rope - left (object side) */}
              <line
                x1={ROPE_LEFT_X} y1={PULLEY_CY}
                x2={ROPE_LEFT_X} y2={objectY}
                stroke="#92400E" strokeWidth="3" strokeLinecap="round"
              />

              {/* Rope - right (pull side) going down */}
              <line
                x1={ROPE_RIGHT_X} y1={PULLEY_CY}
                x2={ROPE_RIGHT_X} y2={ropeHandleY_clamped}
                stroke="#92400E" strokeWidth="3" strokeLinecap="round"
              />

              {/* Object/Box */}
              <motion.g animate={{ y: 0 }} style={{ y: 0 }}>
                <rect
                  x={ROPE_LEFT_X - BOX_W / 2 + 1}
                  y={objectY}
                  width={BOX_W}
                  height={BOX_H}
                  rx="6"
                  fill="#3B82F6"
                  stroke="#1D4ED8"
                  strokeWidth="2"
                />
                <text
                  x={ROPE_LEFT_X + 1}
                  y={objectY + BOX_H / 2 + 6}
                  textAnchor="middle"
                  fontSize="13"
                  fill="white"
                  fontWeight="700"
                >
                  {weightN} N
                </text>
              </motion.g>

              {/* Ground */}
              <rect x="60" y={CANVAS_HEIGHT - 40} width="280" height="10" rx="5" fill="#D1D5DB" />

              {/* Drag handle */}
              <g
                onPointerDown={handlePointerDown}
                style={{ cursor: dragging ? 'grabbing' : 'grab' }}
              >
                <circle
                  cx={ROPE_RIGHT_X}
                  cy={ropeHandleY_clamped}
                  r={14}
                  fill={dragging ? '#1D4ED8' : '#3B82F6'}
                  stroke="white"
                  strokeWidth="3"
                />
                <text x={ROPE_RIGHT_X} y={ropeHandleY_clamped + 5} textAnchor="middle" fontSize="13" fill="white" fontWeight="700">↕</text>
              </g>

              {/* Force arrows on handle */}
              {dragging && (
                <text x={ROPE_RIGHT_X + 20} y={ropeHandleY_clamped} fontSize="11" fill="#374151">
                  ↑ Trage!
                </text>
              )}

              {/* Lift progress bar */}
              <rect x="360" y="40" width="12" height={CANVAS_HEIGHT - 80} rx="6" fill="#E5E7EB" />
              <rect
                x="360"
                y={40 + (CANVAS_HEIGHT - 80) * (1 - liftPct)}
                width="12"
                height={(CANVAS_HEIGHT - 80) * liftPct}
                rx="6"
                fill="#10B981"
              />
            </svg>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Trage de butonul albastru <strong>în sus</strong> pe ecran
              </p>
            </div>
          </div>

          {/* Controls panel */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              Selectează tipul de scripete:
            </p>
            {MODES.map(m => (
              <motion.button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  marginBottom: '10px',
                  borderRadius: '12px',
                  border: mode === m.id ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                  backgroundColor: mode === m.id ? '#EFF6FF' : 'white',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: '600', color: mode === m.id ? '#1D4ED8' : '#1F2937', fontSize: '15px' }}>
                  {mode === m.id ? '●' : '○'} {m.label}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{m.sub}</div>
              </motion.button>
            ))}

            {/* Force info */}
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '2px solid #10B981',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '15px', color: '#065F46', fontWeight: '600', marginBottom: '6px' }}>
                💪 Forță necesară: <span style={{ fontSize: '20px', fontFamily: 'monospace' }}>{forceN} N</span>
              </div>
              <div style={{ fontSize: '14px', color: '#047857' }}>
                Greutate obiect: {weightN} N
              </div>
              <div style={{ fontSize: '14px', color: '#047857' }}>
                Scripete: {mode}× → forță ÷ {mode}
              </div>
            </div>

            {/* Lift indicator */}
            <div style={{
              backgroundColor: '#F5F3FF',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '14px', color: '#7C3AED', fontWeight: '600', marginBottom: '8px' }}>
                Înălțime ridicată: {Math.round(liftPct * 100)}%
              </div>
              <div style={{ height: '10px', backgroundColor: '#E5E7EB', borderRadius: '5px', overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', backgroundColor: '#8B5CF6', borderRadius: '5px' }}
                  animate={{ width: `${liftPct * 100}%` }}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={18} /> Reset
            </motion.button>
          </div>
        </div>
      </div>

      {/* Celebration */}
      <AnimatePresence>
        {celebrated && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundColor: '#ECFDF5',
              border: '3px solid #10B981',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: '700',
              color: '#065F46',
              marginBottom: '16px',
            }}
          >
            ✨ Bravo! Ai ridicat obiectul! Scripetele funcționează! 🎉
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        backgroundColor: '#EFF6FF',
        borderRadius: '12px',
        padding: '16px 20px',
        borderLeft: '4px solid #3B82F6',
      }}>
        <p style={{ fontSize: '15px', color: '#1D4ED8', fontWeight: '500' }}>
          💡 <strong>Exemplu real:</strong> Macaraua de construcții folosește mai multe scripete ca să ridice greutăți mari cu efort mic!
        </p>
      </div>
    </div>
  );
}
