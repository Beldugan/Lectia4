import { motion } from 'framer-motion';

const concepts = [
  {
    icon: '⚙️',
    title: 'Angrenaje',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#8B5CF6',
    points: [
      'Roata mare → roata mică se rotește MAI REPEDE',
      'Roata mare → roata mică are MAI PUȚINĂ forță',
      'Raportul = dințí mari ÷ dințí mici',
      'Exemplu real: ceasul, motorul mașinii',
    ],
  },
  {
    icon: '🪣',
    title: 'Scripetele',
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#3B82F6',
    points: [
      'Schimbă DIRECȚIA forței (tragi jos → obiectul urcă)',
      '2 scripete = jumătate din forță necesară',
      '4 scripete = un sfert din forță necesară',
      'Exemplu real: macaraua de construcții',
    ],
  },
  {
    icon: '🧮',
    title: 'Fapte Inverse ×/÷',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#F59E0B',
    points: [
      '6 × 8 = 48 → 48 ÷ 6 = 8',
      '7 × 5 = 35 → 35 ÷ 7 = 5',
      '4 × 9 = 36 → 36 ÷ 4 = 9',
      '8 × 3 = 24 → 24 ÷ 8 = 3',
    ],
  },
  {
    icon: '🚲',
    title: 'Bicicleta și Vitezele',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#10B981',
    points: [
      'Viteza 1 (mică) → ușor la urcuș, mai puțini metri',
      'Viteza 7 (mare) → rapid pe coborâre, mai mulți metri',
      'Pedale mici + roată mare = amplificare',
      'Exemplu real: mersul pe bicicletă la munte',
    ],
  },
];

export default function Recap() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
          Recap — Ce am învățat azi!
        </h2>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>
          Lecția 4 — Roata, axul și scripetele
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {concepts.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              backgroundColor: c.bg,
              border: `2px solid ${c.border}`,
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px' }}>{c.icon}</span>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: c.color }}>{c.title}</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {c.points.map((p, j) => (
                <li key={j} style={{
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                  fontSize: '14px', color: '#374151', marginBottom: '8px', lineHeight: '1.5',
                }}>
                  <span style={{ color: c.color, fontWeight: '700', flexShrink: 0 }}>✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          backgroundColor: '#1F2937',
          borderRadius: '16px',
          padding: '28px',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌟</div>
        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>
          Principiul de bază al mașinilor simple
        </h3>
        <p style={{ fontSize: '16px', color: '#D1D5DB', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto' }}>
          Toate aceste mașini simple — roata, axul și scripetele — ne ajută să facem <strong style={{ color: '#F59E0B' }}>același lucru</strong> cu <strong style={{ color: '#10B981' }}>mai puțin efort</strong> sau să schimbăm <strong style={{ color: '#3B82F6' }}>direcția forței</strong>!
        </p>
      </motion.div>
    </div>
  );
}
