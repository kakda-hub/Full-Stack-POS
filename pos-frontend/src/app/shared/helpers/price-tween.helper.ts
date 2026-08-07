/**
 * Tween a displayed price toward `target` with requestAnimationFrame.
 * Rapid updates cancel the in-flight tween and continue from the current
 * displayed value, so the number rolls smoothly instead of jumping,
 * flickering or overlapping with a stale "old value" span.
 *
 * Usage in a component (typically from inside an `effect`):
 *   const rafRef = { id: null as number | null };
 *   effect(() => {
 *     const target = this.cart.total();
 *     untracked(() => animatePrice(rafRef, () => this.totalDisplay(), target, v => this.totalDisplay.set(v)));
 *   });
 *
 * @param rafRef - Mutable rAF handle (one per displayed value).
 * @param read   - Reads the current displayed value.
 * @param target - The value to roll toward.
 * @param set    - Writes the next displayed value.
 */
export function animatePrice(
  rafRef: { id: number | null },
  read: () => number,
  target: number,
  set: (v: number) => void,
): void {
  const from = read();
  if (from === target) return;
  if (rafRef.id !== null) cancelAnimationFrame(rafRef.id);
  const diff = target - from;
  const duration = 240;
  const t0 = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    set(from + diff * eased);
    rafRef.id = t < 1 ? requestAnimationFrame(step) : null;
  };
  rafRef.id = requestAnimationFrame(step);
}

/**
 * True when the OS requests reduced motion. The rAF tween bypasses Angular
 * animations, so the global noop-animations swap (provideNoopAnimations in
 * app.module.ts) does NOT cover it — callers must check this and snap the
 * display directly instead of rolling.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  );
}
