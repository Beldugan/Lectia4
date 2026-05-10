import { Settings, Circle, Calculator, Bike, BookOpen, Cog } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'angrenaje', label: 'Angrenaje', icon: Cog, color: '#8B5CF6' },
  { id: 'scripete', label: 'Scripete', icon: Circle, color: '#3B82F6' },
  { id: 'quiz', label: 'Quiz Matematică', icon: Calculator, color: '#F59E0B' },
  { id: 'bicicleta', label: 'Bicicletă', icon: Bike, color: '#10B981' },
];

export default function Layout({ activeModule, onModuleChange, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1F2937',
        color: 'white',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>⚙️</span>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>
            Lecția 4 — Roata, axul și scripetele
          </span>
        </div>
        <div style={{
          backgroundColor: '#374151',
          borderRadius: '8px',
          padding: '6px 14px',
          fontSize: '14px',
          color: '#D1D5DB',
        }}>
          Program STEM
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <nav style={{
          width: '240px',
          flexShrink: 0,
          backgroundColor: 'white',
          borderRight: '1px solid #E5E7EB',
          padding: '24px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <p style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '0 12px',
            marginBottom: '8px',
          }}>Module</p>

          {navItems.map(({ id, label, icon: Icon, color }) => {
            const isActive = activeModule === id;
            return (
              <motion.button
                key={id}
                onClick={() => onModuleChange(id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '15px',
                  fontWeight: isActive ? '600' : '400',
                  backgroundColor: isActive ? `${color}18` : 'transparent',
                  color: isActive ? color : '#374151',
                  borderLeft: isActive ? `4px solid ${color}` : '4px solid transparent',
                  transition: 'background-color 0.15s, color 0.15s',
                  width: '100%',
                }}
              >
                <Icon size={20} style={{ color: isActive ? color : '#6B7280', flexShrink: 0 }} />
                {label}
              </motion.button>
            );
          })}

          <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '8px 12px' }} />

          <motion.button
            onClick={() => onModuleChange('recap')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '15px',
              fontWeight: activeModule === 'recap' ? '600' : '400',
              backgroundColor: activeModule === 'recap' ? '#FEF3C718' : 'transparent',
              color: activeModule === 'recap' ? '#D97706' : '#374151',
              borderLeft: activeModule === 'recap' ? '4px solid #D97706' : '4px solid transparent',
              width: '100%',
            }}
          >
            <BookOpen size={20} style={{ color: activeModule === 'recap' ? '#D97706' : '#6B7280' }} />
            Recap Final
          </motion.button>
        </nav>

        {/* Main content */}
        <main style={{
          flex: 1,
          padding: '32px',
          backgroundColor: '#FAF7F2',
          overflow: 'auto',
        }}>
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
