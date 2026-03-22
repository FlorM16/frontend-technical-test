const STORAGE_KEY = 'country-explorer-recent-searches';
const MAX_ITEMS = 10;
const MAX_TERM_LENGTH = 100;

function parseStored(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim().slice(0, MAX_TERM_LENGTH))
      .filter((s) => s.length > 0);
  } catch {
    return [];
  }
}

export function getRecentSearches(): string[] {
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): void {
  const normalized = term.trim().slice(0, MAX_TERM_LENGTH);
  if (!normalized) return;
  try {
    const prev = getRecentSearches().filter(
      (s) => s.toLowerCase() !== normalized.toLowerCase(),
    );
    const next = [normalized, ...prev].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    //Si setItem falla (cuota, privado, bloqueo), la app sigue sin error.
  }
}
