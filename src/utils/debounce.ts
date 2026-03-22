export const SEARCH_DEBOUNCE_MS = 300;

export function debounce<A extends unknown[]>(
  callback: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  // DECISION: debounce trailing-edge: el callback solo corre tras waitMs sin nuevas llamadas
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
