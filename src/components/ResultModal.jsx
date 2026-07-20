import { motion } from 'framer-motion';

export function ResultModal({ prize, onPlayAgain, onClose }) {
  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="result-modal" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}>
        <div className="confetti">{prize.isNoPrize ? '✨🍀✨' : '🎉✨🎊'}</div>
        <p className="eyebrow">{prize.isNoPrize ? '🔄 SEGUNDA CHANCE' : '🏆 VOCÊ GANHOU!'}</p>
        <h3>{prize.name}</h3>
        <p>{prize.isNoPrize ? 'Mas não desista! Você tem outra chance para ganhar um prêmio incrível.' : 'Parabéns! Este prêmio especial é seu. Aproveite bem!'}</p>
        <button className="primary-button" type="button" onClick={onPlayAgain}>
          ✨ TENTAR NOVAMENTE
        </button>
        <button className="ghost-button" type="button" onClick={onClose}>
          Fechar
        </button>
      </motion.div>
    </motion.div>
  );
}
