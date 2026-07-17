import { motion } from 'framer-motion';

export function ResultModal({ prize, onPlayAgain, onClose }) {
  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="result-modal" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}>
        <div className="confetti">🎉✨🎊</div>
        <p className="eyebrow">{prize.isNoPrize ? 'SEM PRÉMIO' : 'PARABÉNS'}</p>
        <h3>{prize.name}</h3>
        <p>{prize.isNoPrize ? 'Não houve prémio desta vez. Tente novamente.' : 'Este prémio foi reservado para si.'}</p>
        <button className="primary-button" type="button" onClick={onPlayAgain}>
          JOGAR NOVAMENTE
        </button>
        <button className="ghost-button" type="button" onClick={onClose}>
          Fechar
        </button>
      </motion.div>
    </motion.div>
  );
}
