import * as React from "react";

// Batas HP mengikuti design.md 4.5 (di bawah 768px sidebar menjadi laci).
const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

// Berlangganan media query tanpa setState di dalam effect (aturan react-hooks).
// Di server dianggap bukan HP; nilai sebenarnya dipakai setelah hidrasi.
export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
