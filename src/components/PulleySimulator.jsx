import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const CANVAS_W = 400;
const CANVAS_H = 420;
const GROUND_Y = 390;
const BOX_W = 56;
const BOX_H = 50;
const WEIGHT_N = 50;

// objectY = top of weight box (starts near ground, rises as lift increases)
const INIT_OBJ_Y = GROUND_Y - BOX_H; // 340

// When pulling DOWN on handle, weight goes UP
// handleY starts just below fixed pulley and moves DOWN as lift increases

const MODES = [
  { id: 1, label: '1 scripete', sub: 'Schimbă direcția — aceeași forță', factor: 1 },
  { id: 2, label: '2 scripeți', sub: 'Jumătate din forța necesară', factor: 2 },
  { id: 4, label: '4 scripeți', sub: 'Un sfert din forța necesară', factor: 4 },
];

function FixedPulley({ cx, cy, r, label }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#4B5563" />
      <circle cx={cx} cy={cy} r={r - 7} fill="#9CA3AF" />
      <circle cx={cx} cy={cy} r={4} fill="#1F2937" />
      {label && <text x={cx} y={cy - r - 8} textAnchor="middle" fontSize="10" fill="#6B7280" fontWeight="600">{label}</text>}
    </g>
  );
}

function MovablePulley({ cx, cy, r }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#3B82F6" />
      <circle cx={cx} cy={cy} r={r - 6} fill="#BFDBFE" />
      <circle cx={cx} cy={cy} r={4} fill="#1E40AF" />
    </g>
  );
}

function WeightBox({ cx, y, label }) {
  return (
    <g>
      <rect x={cx - BOX_W / 2} y={y} width={BOX_W} height={BOX_H} rx={6} fill="#3B82F6" stroke="#1D4ED8" strokeWidth={2} />
      <text x={cx} y={y + BOX_H / 2 + 6} textAnchor="middle" fontSize={13} fill="white" fontWeight="700">{label}</text>
    </g>
  );
}

function DragHandle({ cx, cy, onPointerDown, dragging }) {
  return (
    <g onPointerDown={onPointerDown} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
      <circle cx={cx} cy={cy} r={15} fill={dragging ? '#1D4ED8' : '#3B82F6'} stroke="white" strokeWidth={3} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fill="white" fontWeight="700">↓</text>
    </g>
  );
}

// ── Mode 1: 1 fixed pulley ────────────────────────────────────────────────────
// Physics: pull RIGHT rope DOWN → LEFT rope (with weight) goes UP
function Mode1SVG({ objectY, handleY, onPointerDown, dragging }) {
  const FX = 200, FY = 70, FR = 26;
  const LX = FX - FR - 2; // left rope x (weight side)
  const RX = FX + FR + 2; // right rope x (pull side)

  return (
    <g>
      <rect x={60} y={18} width={280} height={12} rx={6} fill="#374151" />
      <FixedPulley cx={FX} cy={FY} r={FR} label="fix" />
      {/* Left rope: pulley → weight */}
      <line x1={LX} y1={FY} x2={LX} y2={objectY} stroke="#92400E" strokeWidth={3} strokeLinecap="round" />
      {/* Right rope: pulley → handle (gets longer as weight rises) */}
      <line x1={RX} y1={FY} x2={RX} y2={handleY} stroke="#92400E" strokeWidth={3} strokeLinecap="round" />
      <WeightBox cx={LX} y={objectY} label={`${WEIGHT_N} N`} />
      <DragHandle cx={RX} cy={handleY} onPointerDown={onPointerDown} dragging={dragging} />
      <rect x={60} y={GROUND_Y} width={280} height={8} rx={4} fill="#D1D5DB" />
    </g>
  );
}

// ── Mode 2: 1 fixed + 1 movable pulley ───────────────────────────────────────
// Rope: ceiling anchor → under movable pulley → over fixed pulley → pull down
function Mode2SVG({ objectY, handleY, onPointerDown, dragging }) {
  const FX = 270, FY = 65, FR = 22;
  const MR = 19;
  const MX = 130; // movable pulley x (fixed horizontal position)
  const MY = objectY - MR - 8; // movable pulley rises with weight
  const AX = 90, AY = 28; // rope anchor on ceiling
  const PULL_X = FX + FR + 5;

  return (
    <g>
      <rect x={60} y={18} width={280} height={12} rx={6} fill="#374151" />
      {/* Ceiling anchor dot */}
      <circle cx={AX} cy={AY} r={6} fill="#374151" />
      <text x={AX} y={AY - 10} textAnchor="middle" fontSize={9} fill="#6B7280">ancoră</text>

      {/* Rope 1: anchor → left of movable pulley */}
      <line x1={AX} y1={AY} x2={MX - MR} y2={MY} stroke="#92400E" strokeWidth={3} strokeLinecap="round" />
      {/* Rope 2: right of movable → LEFT side of fixed (rope trece pe DEASUPRA scripetui fix) */}
      <line x1={MX + MR} y1={MY} x2={FX - FR} y2={FY} stroke="#92400E" strokeWidth={3} strokeLinecap="round" />
      {/* Rope 3: RIGHT side of fixed → handle going DOWN */}
      <line x1={FX + FR} y1={FY} x2={FX + FR} y2={handleY} stroke="#92400E" strokeWidth={3} strokeLinecap="round" />
      {/* Rope 4: movable pulley → weight box (vertical connection) */}
      <line x1={MX} y1={MY + MR} x2={MX} y2={objectY} stroke="#92400E" strokeWidth={3} strokeLinecap="round" />

      <FixedPulley cx={FX} cy={FY} r={FR} label="fix" />
      <MovablePulley cx={MX} cy={MY} r={MR} />
      <text x={MX} y={MY + MR + 14} textAnchor="middle" fontSize={9} fill="#3B82F6" fontWeight="600">mobil</text>

      <WeightBox cx={MX} y={objectY} label={`${WEIGHT_N} N`} />
      <DragHandle cx={FX + FR} cy={handleY} onPointerDown={onPointerDown} dragging={dragging} />
      <rect x={60} y={GROUND_Y} width={280} height={8} rx={4} fill="#D1D5DB" />
    </g>
  );
}

// ── Mode 4: 2 fixed + 2 movable pulleys ──────────────────────────────────────
// Sfoara: ancoră → sub M1 → deasupra F1 → sub M2 → deasupra F2 → trage în jos
function Mode4SVG({ objectY, handleY, onPointerDown, dragging }) {
  const FR = 17;
  const F1X = 185, F1Y = 58;
  const F2X = 268, F2Y = 58;
  const MR = 14;
  // M2X trebuie > F1X + FR (202) ca sfoara să meargă dreapta-jos de la F1 la M2
  const M1X = 112, M2X = 220;
  const M1Y = objectY - MR - 8;
  const M2Y = objectY - MR - 8;
  const AX = 72, AY = 28;
  const PULL_X = F2X + FR; // sfoara iese din dreapta F2

  return (
    <g>
      <rect x={48} y={18} width={318} height={12} rx={6} fill="#374151" />
      {/* Anchor */}
      <circle cx={AX} cy={AY} r={5} fill="#374151" />
      <text x={AX} y={AY - 9} textAnchor="middle" fontSize={9} fill="#6B7280">ancoră</text>

      {/* Ropes — fiecare trece pe STÂNGA scripetui fix și iese pe DREAPTA */}
      <line x1={AX} y1={AY} x2={M1X - MR} y2={M1Y} stroke="#92400E" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={M1X + MR} y1={M1Y} x2={F1X - FR} y2={F1Y} stroke="#92400E" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={F1X + FR} y1={F1Y} x2={M2X - MR} y2={M2Y} stroke="#92400E" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={M2X + MR} y1={M2Y} x2={F2X - FR} y2={F2Y} stroke="#92400E" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={PULL_X} y1={F2Y} x2={PULL_X} y2={handleY} stroke="#92400E" strokeWidth={2.5} strokeLinecap="round" />
      {/* Vertical connections from movable pulleys to weight */}
      <line x1={M1X} y1={M1Y + MR} x2={M1X} y2={objectY} stroke="#92400E" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={M2X} y1={M2Y + MR} x2={M2X} y2={objectY} stroke="#92400E" strokeWidth={2.5} strokeLinecap="round" />

      <FixedPulley cx={F1X} cy={F1Y} r={FR} label="fix 1" />
      <FixedPulley cx={F2X} cy={F2Y} r={FR} label="fix 2" />
      <MovablePulley cx={M1X} cy={M1Y} r={MR} />
      <text x={M1X} y={M1Y + MR + 13} textAnchor="middle" fontSize={8} fill="#3B82F6" fontWeight="600">mobil 1</text>
      <MovablePulley cx={M2X} cy={M2Y} r={MR} />
      <text x={M2X} y={M2Y + MR + 13} textAnchor="middle" fontSize={8} fill="#3B82F6" fontWeight="600">mobil 2</text>

      {/* Weight box spanning both connection points */}
      <rect x={M1X - BOX_W / 2} y={objectY} width={M2X - M1X + BOX_W} height={BOX_H} rx={6} fill="#3B82F6" stroke="#1D4ED8" strokeWidth={2} />
      <text x={(M1X + M2X) / 2} y={objectY + BOX_H / 2 + 6} textAnchor="middle" fontSize={13} fill="white" fontWeight="700">{WEIGHT_N} N</text>

      <DragHandle cx={PULL_X} cy={handleY} onPointerDown={onPointerDown} dragging={dragging} />
      <rect x={50} y={GROUND_Y} width={310} height={8} rx={4} fill="#D1D5DB" />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PulleySimulator() {
  const [mode, setMode] = useState(1);
  const [lift, setLift] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const dragStartY = useRef(null);
  const liftStartRef = useRef(0);

  // maxLift: from initial objectY down to just below ceiling ropes
  const maxLift = INIT_OBJ_Y - 100; // ~240

  const objectY = INIT_OBJ_Y - lift;

  // Handle starts just below the fixed pulley and moves DOWN as lift increases
  // (pulling right rope down = weight rises — correct pulley physics)
  const HANDLE_START_Y = mode === 1 ? 100 : 92;
  const handleY = Math.min(GROUND_Y - 10, HANDLE_START_Y + lift);

  const liftPct = Math.min(lift / maxLift, 1);
  const forceN = +(WEIGHT_N / mode).toFixed(1);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    dragStartY.current = e.clientY;
    liftStartRef.current = lift;
  }, [lift]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    // Drag DOWN (clientY increases) → lift increases → weight rises
    const dy = e.clientY - dragStartY.current;
    const newLift = Math.max(0, Math.min(maxLift, liftStartRef.current + dy));
    setLift(newLift);
    if (newLift >= maxLift * 0.92) setCelebrated(true);
  }, [dragging, maxLift]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

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

  const handleReset = () => { setLift(0); setCelebrated(false); };
  const handleModeChange = (m) => { setMode(m); handleReset(); };

  const svgProps = { objectY, handleY, onPointerDown: handlePointerDown, dragging };

  return (
    <div>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1F2937', marginBottom: '6px' }}>
          🪣 Scripete — Trage sfoara, ridică obiectul!
        </h2>
        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '24px' }}>
          Trage <strong>butonul albastru ÎN JOS</strong> → obiectul se ridică în SUS. Mai mulți scripeți = mai puțină forță!
        </p>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* SVG */}
          <div style={{ flex: '0 0 auto' }}>
            <svg
              width={CANVAS_W} height={CANVAS_H}
              style={{ border: '2px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB', touchAction: 'none', display: 'block' }}
            >
              {/* Progress bar */}
              <rect x={CANVAS_W - 22} y={30} width={10} height={CANVAS_H - 60} rx={5} fill="#E5E7EB" />
              <rect
                x={CANVAS_W - 22}
                y={30 + (CANVAS_H - 60) * (1 - liftPct)}
                width={10}
                height={(CANVAS_H - 60) * liftPct}
                rx={5}
                fill="#10B981"
              />

              {mode === 1 && <Mode1SVG {...svgProps} />}
              {mode === 2 && <Mode2SVG {...svgProps} />}
              {mode === 4 && <Mode4SVG {...svgProps} />}
            </svg>
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginTop: '10px' }}>
              Trage butonul <strong>↓ în jos</strong> pe ecran
            </p>
          </div>

          {/* Controls panel */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Selectează tipul de scripete:</p>
            {MODES.map(m => (
              <motion.button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 16px', marginBottom: '10px', borderRadius: '12px',
                  border: mode === m.id ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                  backgroundColor: mode === m.id ? '#EFF6FF' : 'white', cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: '600', color: mode === m.id ? '#1D4ED8' : '#1F2937', fontSize: '15px' }}>
                  {mode === m.id ? '●' : '○'} {m.label}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{m.sub}</div>
              </motion.button>
            ))}

            <div style={{ backgroundColor: '#F0FDF4', border: '2px solid #10B981', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', color: '#065F46', fontWeight: '600', marginBottom: '6px' }}>
                💪 Forță necesară: <span style={{ fontSize: '20px', fontFamily: 'monospace' }}>{forceN} N</span>
              </div>
              <div style={{ fontSize: '14px', color: '#047857' }}>Greutate obiect: {WEIGHT_N} N</div>
              <div style={{ fontSize: '14px', color: '#047857' }}>{mode} {mode === 1 ? 'scripete' : 'scripeți'} → forță ÷ {mode}</div>
            </div>

            <div style={{ backgroundColor: '#F5F3FF', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#7C3AED', fontWeight: '600', marginBottom: '8px' }}>
                Înălțime ridicată: {Math.round(liftPct * 100)}%
              </div>
              <div style={{ height: '10px', backgroundColor: '#E5E7EB', borderRadius: '5px', overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', backgroundColor: '#8B5CF6', borderRadius: '5px' }} animate={{ width: `${liftPct * 100}%` }} />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '12px',
                backgroundColor: '#F3F4F6', color: '#374151',
                border: '2px solid #E5E7EB', borderRadius: '12px',
                fontSize: '15px', fontWeight: '600', cursor: 'pointer',
              }}
            >
              <RotateCcw size={18} /> Reset
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {celebrated && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            style={{ backgroundColor: '#ECFDF5', border: '3px solid #10B981', borderRadius: '16px', padding: '20px', textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#065F46', marginBottom: '16px' }}
          >
            ✨ Bravo! Ai ridicat obiectul! Scripetele funcționează! 🎉
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '16px 20px', borderLeft: '4px solid #3B82F6' }}>
        <p style={{ fontSize: '15px', color: '#1D4ED8', fontWeight: '500' }}>
          💡 <strong>Exemplu real:</strong> Macaraua de construcții folosește mai mulți scripeți ca să ridice greutăți mari cu efort mic!
        </p>
      </div>
    </div>
  );
}
