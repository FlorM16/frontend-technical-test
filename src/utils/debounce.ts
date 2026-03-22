export const SEARCH_DEBOUNCE_MS = 300;

export function debounce<A extends unknown[]>(
  callback: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  // DECISION: se usa trailing-edge y no leading-edge: el callback se ejecuta tras la pausa sin teclas, no al primer pulsado. Con leading-edge habría una petición por tecla; se prefiere trailing-edge para cumplir el requisito de no llamar a la API en cada keystroke y aun así filtrar mientras el usuario escribe.
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
