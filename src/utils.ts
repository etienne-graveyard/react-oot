export function invariantOverlayContext<T>(val: T | null): T {
  if (val === null) {
    throw new Error(`Invariant: OverlayContext is missing`);
  }
  return val;
}
