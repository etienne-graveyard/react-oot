import cuid from 'cuid';

export type OverlayToken = symbol;

export const OverlayToken = {
  create: createOverlayToken,
};

function createOverlayToken(debugName: string): symbol {
  return Symbol(`OVERLAY_TOKEN_${cuid.slug()}_${debugName}`);
}
