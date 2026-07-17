const defaultPrizes = [
  { id: 1, name: 'Caneta', probability: 12, active: true, awardedCount: 0, isNoPrize: false },
  { id: 2, name: 'Agenda', probability: 10, active: true, awardedCount: 0, isNoPrize: false },
  { id: 3, name: 'Garrafa', probability: 10, active: true, awardedCount: 0, isNoPrize: false },
  { id: 4, name: 'Mochila', probability: 8, active: true, awardedCount: 0, isNoPrize: false },
  { id: 5, name: 'Boné', probability: 8, active: true, awardedCount: 0, isNoPrize: false },
  { id: 6, name: 'T-shirt', probability: 8, active: true, awardedCount: 0, isNoPrize: false },
  { id: 7, name: 'Guarda-chuva', probability: 6, active: true, awardedCount: 0, isNoPrize: false },
  { id: 8, name: 'Vale Brinde', probability: 6, active: true, awardedCount: 0, isNoPrize: false },
  { id: 9, name: 'Chaveiro', probability: 6, active: true, awardedCount: 0, isNoPrize: false },
  { id: 10, name: 'Obrigado pela participação', probability: 20, active: true, awardedCount: 0, isNoPrize: false },
  { id: 11, name: 'Não foi desta, tente novamente', probability: 6, active: true, awardedCount: 0, isNoPrize: true }
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
