import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PrimaryButton } from './components/PrimaryButton';
import { ResultModal } from './components/ResultModal';
import { createDefaultPrizes, readStoredPrizes, savePrizesToStorage } from './data/prizes';
import logo from './assets/logotipo/Logotipo.png';

const STORAGE_KEY = 'fortaleza-roleta-prizes';
const IDLE_TIMEOUT = 20000;

function App() {
  const [prizes, setPrizes] = useState(() => readStoredPrizes(STORAGE_KEY));
  const [view, setView] = useState('home');
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const idleTimerRef = useRef(null);
  const logoTapTimerRef = useRef(null);
  const audioContextRef = useRef(null);

  const activePrizes = useMemo(() => prizes.filter((prize) => prize.active), [prizes]);

  useEffect(() => {
    const savedPrizes = readStoredPrizes(STORAGE_KEY);
    if (savedPrizes.length) {
      setPrizes(savedPrizes);
    }
  }, []);

  useEffect(() => {
    savePrizesToStorage(STORAGE_KEY, prizes);
  }, [prizes]);

  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        setView('home');
        setShowResult(false);
        setSelectedPrize(null);
      }, IDLE_TIMEOUT);
    };

    resetIdleTimer();
    window.addEventListener('pointerdown', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);

    return () => {
      window.removeEventListener('pointerdown', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [view]);

  const ensureAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playTone = (frequency, duration, type = 'sine', volume = 0.03) => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  };

  const handleSpin = () => {
    if (isSpinning || activePrizes.length === 0) return;

    const availablePrizes = prizes.filter((prize) => prize.active);
    const totalProbability = availablePrizes.reduce((sum, prize) => sum + prize.probability, 0);
    let randomValue = Math.random() * totalProbability;

    let winner = availablePrizes[0];
    for (const prize of availablePrizes) {
      randomValue -= prize.probability;
      if (randomValue <= 0) {
        winner = prize;
        break;
      }
    }

    const selectedIndex = prizes.findIndex((prize) => prize.id === winner.id);
    const targetRotation = -((selectedIndex * 36) + 18);
    const spins = 6 + Math.floor(Math.random() * 3);
    const currentBase = ((wheelRotation % 360) + 360) % 360;
    const delta = 360 * spins + ((targetRotation - currentBase + 360) % 360);

    setIsSpinning(true);
    setSelectedPrize(winner);
    setShowResult(false);
    setView('spinning');
    setWheelRotation((prev) => prev + delta);

    playTone(420, 0.2, 'sine', 0.02);
    playTone(620, 0.24, 'triangle', 0.015);

    window.setTimeout(() => {
      setPrizes((prev) =>
        prev.map((prize) =>
          prize.id === winner.id
            ? {
                ...prize,
                awardedCount: prize.isNoPrize ? prize.awardedCount : prize.awardedCount + 1
              }
            : prize
        )
      );
      setView('result');
      setShowResult(true);
      setIsSpinning(false);
      playTone(760, 0.3, 'square', 0.025);
    }, 6200);
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    setSelectedPrize(null);
    setView('home');
  };

  const handleLogoTap = () => {
    setLogoTaps((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdmin(true);
        return 0;
      }
      if (logoTapTimerRef.current) {
        window.clearTimeout(logoTapTimerRef.current);
      }
      logoTapTimerRef.current = window.setTimeout(() => setLogoTaps(0), 1000);
      return next;
    });
  };

  const updatePrizeField = (id, field, value) => {
    setPrizes((prev) =>
      prev.map((prize) =>
        prize.id === id
          ? { ...prize, [field]: field === 'probability' ? Number(value) : value }
          : prize
      )
    );
  };

  const resetStats = () => {
    setPrizes((prev) => prev.map((prize) => ({ ...prize, awardedCount: 0 })));
  };

  return (
    <div className="app-shell">
      <motion.main
        className="app-stage"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <button className="logo-button" onClick={handleLogoTap} type="button" aria-label="Abrir painel administrativo">
          <img src={logo} alt="Logótipo Fortaleza Seguros" />
        </button>

        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.section
              key="home"
              className="screen-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="hero-logo"
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <img src={logo} alt="Fortaleza Seguros" />
              </motion.div>
              <div className="hero-copy">
                <h1>ROleta DA SORTE</h1>
              </div>
              <PrimaryButton onClick={handleSpin}>GIRAR A ROLETA</PrimaryButton>
            </motion.section>
          )}

          {view === 'spinning' && (
            <motion.section
              key="wheel"
              className="screen-card wheel-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="wheel-hint">A sua sorte está a ser escolhida…</div>
              <div className="wheel-wrapper">
                <div className="wheel-pointer" aria-hidden="true" />
                <motion.div
                  className="wheel"
                  animate={{ rotate: wheelRotation }}
                  transition={{ duration: 5.5, ease: [0.17, 0.67, 0.83, 0.99] }}
                >
                  <div className="wheel-center" />
                  {prizes.map((prize, index) => (
                    <div key={prize.id} className="wheel-segment" style={{ '--segment-angle': `${index * 36}deg` }}>
                      <span>{prize.name}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.section>
          )}

          {view === 'result' && selectedPrize && (
            <motion.section
              key="result"
              className="screen-card result-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="result-card">
                <p className="eyebrow">{selectedPrize.isNoPrize ? 'SEM PRÉMIO' : 'PRÉMIO ATRIBUÍDO'}</p>
                <div className="result-badge">{selectedPrize.isNoPrize ? '😔' : '🎉'}</div>
                <h2>{selectedPrize.name}</h2>
                <p className="result-copy">
                  {selectedPrize.isNoPrize
                    ? 'Não houve prémio desta vez. Tente novamente!'
                    : 'Parabéns! Este foi o prémio sorteado para si.'}
                </p>
                <div className="result-highlight">{selectedPrize.isNoPrize ? 'Não foi desta' : 'Ganhou'}</div>
                <PrimaryButton onClick={handlePlayAgain}>JOGAR NOVAMENTE</PrimaryButton>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.main>

      <AnimatePresence>
        {showResult && selectedPrize && (
          <ResultModal prize={selectedPrize} onPlayAgain={handlePlayAgain} onClose={() => setShowResult(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdmin && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-panel" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}>
              <div className="admin-header">
                <h3>Painel Administrativo</h3>
                <button type="button" className="ghost-button" onClick={() => setShowAdmin(false)}>
                  Fechar
                </button>
              </div>

              <div className="admin-list">
                {prizes.map((prize) => (
                  <div key={prize.id} className="admin-card">
                    <label>
                      <span>Prémio</span>
                      <input value={prize.name} onChange={(event) => updatePrizeField(prize.id, 'name', event.target.value)} />
                    </label>
                    <label>
                      <span>Probabilidade</span>
                      <input type="number" min="0" max="100" value={prize.probability} onChange={(event) => updatePrizeField(prize.id, 'probability', event.target.value)} />
                    </label>
                    <label className="toggle-row">
                      <span>Ativo</span>
                      <input type="checkbox" checked={prize.active} onChange={(event) => updatePrizeField(prize.id, 'active', event.target.checked)} />
                    </label>
                    <div className="admin-stats">
                      <span>Atribuído: {prize.awardedCount}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-actions">
                <button type="button" className="ghost-button" onClick={resetStats}>
                  Reiniciar estatísticas
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
