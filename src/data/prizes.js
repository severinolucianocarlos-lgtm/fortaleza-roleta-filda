const defaultPrizes = [
  { id: 1, name: '✏️ Lápis', probability: 17, active: true, awardedCount: 0, isNoPrize: false },
  { id: 2, name: '🖊️ Caneta', probability: 17, active: true, awardedCount: 0, isNoPrize: false },
  { id: 3, name: '⚽ Bola', probability: 17, active: true, awardedCount: 0, isNoPrize: false },
  { id: 4, name: '🔑 Porta-Chaves', probability: 17, active: true, awardedCount: 0, isNoPrize: false },
  { id: 5, name: '⏳ Próxima Chance', probability: 16, active: true, awardedCount: 0, isNoPrize: true },
  { id: 6, name: '❌ Não foi dessa', probability: 16, active: true, awardedCount: 0, isNoPrize: true }
];

export function createDefaultPrizes() {
  return defaultPrizes.map((prize) => ({ ...prize }));
}

export function readStoredPrizes(storageKey) {
  const defaults = createDefaultPrizes();
  if (typeof window === 'undefined') return defaults;
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return defaults;
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.length) return defaults;

    return defaults.map((defaultPrize) => {
      const existing = parsed.find((item) => item.id === defaultPrize.id);
      return existing ? { ...defaultPrize, ...existing } : { ...defaultPrize };
    });
  } catch {
    return defaults;
  }
}

export function savePrizesToStorage(storageKey, prizes) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(prizes));
}

export default createDefaultPrizes;
