export const SEARCH_DEBOUNCE_MS = 300;

export function debounce<A extends unknown[]>(
  callback: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  // DECISION: trailing-edge y no leading-edge: el callback corre tras la pausa sin teclas, no al primer tecleo; con esto podemos “filtrar mientras escribe” sin una petición por pulsación.
  return (...args: A) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      callback(...args);
    }, waitMs);
  };
}
