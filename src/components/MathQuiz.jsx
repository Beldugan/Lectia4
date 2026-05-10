import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Clock } from 'lucide-react';
import { quizData } from '../data/quizData';

function buildQuestions() {
  const questions = [];
  quizData.forEach(item => {
    questions.push({ type: 'mul', a: item.multiplication.a, b: item.multiplication.b, answer: item.multiplication.answer, hint: item.hint });
    questions.push({ type: 'div', dividend: item.division.dividend, divisor: item.division.divisor, answer: item.division.answer, hint: `${item.division.dividend} ÷ ${item.division.divisor} = ?` });
  });
  return questions;
}

const ALL_QUESTIONS = buildQuestions();

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function MathQuiz() {
  const [questions] = useState(ALL_QUESTIONS);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintTimer, setHintTimer] = useState(0);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const hintRef = useRef(null);
  const bestScore = parseInt(localStorage.getItem('quiz_best_score') || '0');

  const q = questions[current];
  const questionText = q.type === 'mul'
    ? `${q.a} × ${q.b} = ?`
    : `${q.dividend} ÷ ${q.divisor} = ?`;

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [done]);

  useEffect(() => {
    if (!feedback && !done) {
      setHintTimer(0);
      setShowHint(false);
      hintRef.current = setInterval(() => {
        setHintTimer(t => {
          if (t >= 14) {
            setShowHint(true);
            clearInterval(hintRef.current);
            return 15;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(hintRef.current);
  }, [current, feedback, done]);

  useEffect(() => {
    if (!feedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [current, feedback]);

  const handleVerify = useCallback(() => {
    if (feedback || !input.trim()) return;
    const val = parseInt(input.trim(), 10);
    if (val === q.answer) {
      setFeedback('correct');
      setScore(s => s + 1);
      clearInterval(hintRef.current);
      setTimeout(() => {
        setInput('');
        setFeedback(null);
        setShowHint(false);
        if (current + 1 >= questions.length) {
          setDone(true);
          clearInterval(timerRef.current);
          const newScore = score + 1;
          if (newScore > bestScore) {
            localStorage.setItem('quiz_best_score', newScore.toString());
          }
        } else {
          setCurrent(c => c + 1);
        }
      }, 1200);
    } else {
      setFeedback('wrong');
      setShake(true);
      setTimeout(() => {
        setFeedback(null);
        setShake(false);
        setInput('');
      }, 1000);
    }
  }, [input, q, feedback, current, questions.length, score, bestScore]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleVerify();
  };

  const handleRestart = () => {
    setCurrent(0);
    setInput('');
    setFeedback(null);
    setScore(0);
    setElapsed(0);
    setDone(false);
    setShowHint(false);
    setHintTimer(0);
  };

  const finalBest = Math.max(score, bestScore);

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '48px 32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            {pct >= 80 ? '🏅' : pct >= 50 ? '⭐' : '💪'}
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '12px' }}>
            {pct >= 80 ? 'Felicitări! Excelent!' : pct >= 50 ? 'Bine! Continuă să exersezi!' : 'Nu-i bai, mai încearcă!'}
          </h2>
          <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '24px' }}>
            Scor: <strong style={{ color: '#8B5CF6', fontSize: '24px' }}>{score}</strong> / {questions.length} răspunsuri corecte
          </p>
          <p style={{ fontSize: '15px', color: '#9CA3AF', marginBottom: '8px' }}>
            Timp total: {formatTime(elapsed)}
          </p>
          <p style={{ fontSize: '15px', color: '#9CA3AF', marginBottom: '32px' }}>
            Record: {finalBest} / {questions.length}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            {questions.map((_, i) => (
              <span key={i} style={{ fontSize: '28px' }}>{i < score ? '⭐' : '○'}</span>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRestart}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              margin: '0 auto',
              padding: '14px 36px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={22} /> Reia quiz-ul
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
              🧮 Matematică Mentală — Fapte Inverse
            </h2>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              Înmulțirea și împărțirea sunt surori — dacă știi una, o știi pe cealaltă!
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#F3F4F6',
            borderRadius: '10px',
            padding: '8px 14px',
          }}>
            <Clock size={16} style={{ color: '#6B7280' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: '700', color: '#374151' }}>
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>
            Întrebarea {current + 1} din {questions.length}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                width: '20px', height: '20px',
                borderRadius: '50%',
                backgroundColor: i < current ? '#10B981' : i === current ? '#8B5CF6' : '#E5E7EB',
                fontSize: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
              }}>
                {i < current ? '✓' : ''}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', marginBottom: '32px', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', backgroundColor: '#8B5CF6', borderRadius: '4px' }}
            animate={{ width: `${(current / questions.length) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: shake ? [-8, 8, -6, 6, -4, 0] : 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              backgroundColor: feedback === 'correct' ? '#ECFDF5' : feedback === 'wrong' ? '#FEF2F2' : '#F5F3FF',
              border: `3px solid ${feedback === 'correct' ? '#10B981' : feedback === 'wrong' ? '#EF4444' : '#8B5CF6'}`,
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#1F2937', marginBottom: '28px', fontFamily: 'monospace' }}>
              {questionText}
            </div>

            {feedback === 'correct' && (
              <div style={{ fontSize: '24px', color: '#059669', fontWeight: '700', marginBottom: '12px' }}>
                ✅ Corect! {q.answer} este răspunsul!
              </div>
            )}
            {feedback === 'wrong' && (
              <div style={{ fontSize: '20px', color: '#DC2626', fontWeight: '600', marginBottom: '12px' }}>
                ❌ Mai încearcă!
              </div>
            )}

            {!feedback && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  ref={inputRef}
                  type="number"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Răspuns..."
                  style={{
                    fontSize: '24px',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    padding: '12px 20px',
                    border: '2px solid #C4B5FD',
                    borderRadius: '12px',
                    width: '160px',
                    textAlign: 'center',
                    outline: 'none',
                    color: '#1F2937',
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerify}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    minHeight: '54px',
                  }}
                >
                  ✔ Verifică
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Hint */}
        <AnimatePresence>
          {showHint && !feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                backgroundColor: '#FFFBEB',
                border: '2px solid #F59E0B',
                borderRadius: '12px',
                padding: '14px 20px',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '15px', color: '#92400E', fontWeight: '600' }}>
                💡 Indiciu: {q.hint}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!showHint && !feedback && hintTimer < 15 && (
          <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', marginBottom: '16px' }}>
            💡 Indiciu disponibil în {15 - hintTimer}s
          </p>
        )}

        {/* Score stars */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6B7280', marginRight: '8px' }}>Scor:</span>
          {questions.map((_, i) => (
            <span key={i} style={{ fontSize: '24px' }}>{i < score ? '⭐' : '○'}</span>
          ))}
          <span style={{ fontSize: '14px', color: '#6B7280', marginLeft: '8px' }}>({score}/{questions.length})</span>
        </div>
      </div>

      {/* Pair explanation */}
      {q.type === 'div' && current > 0 && (
        <div style={{
          backgroundColor: '#EFF6FF',
          borderRadius: '12px',
          padding: '16px 20px',
          borderLeft: '4px solid #3B82F6',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '15px', color: '#1D4ED8' }}>
            🔗 <strong>Legătura inversă:</strong> Ai rezolvat <strong>{questions[current-1]?.a} × {questions[current-1]?.b} = {questions[current-1]?.answer}</strong>,
            iar acum inversul: <strong>{q.dividend} ÷ {q.divisor} = ?</strong>
          </p>
        </div>
      )}

      <div style={{
        backgroundColor: '#EFF6FF',
        borderRadius: '12px',
        padding: '16px 20px',
        borderLeft: '4px solid #3B82F6',
      }}>
        <p style={{ fontSize: '15px', color: '#1D4ED8', fontWeight: '500' }}>
          💡 <strong>Trucul matematicii:</strong> Dacă știi că 6 × 8 = 48, atunci automat știi că 48 ÷ 6 = 8 și 48 ÷ 8 = 6!
        </p>
      </div>
    </div>
  );
}
