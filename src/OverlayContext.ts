import React from 'react';
import { OverlayManager } from './OverlayManager';
import { OverlayToken } from './OverlayToken';

// parent overlay or null if top level
export const OverlayContext = React.createContext<OverlayToken | null>(null);

export const OverlayManagerContext = React.createContext<OverlayManager | null>(null);

export function useOverlayParent(): OverlayToken {
  const overlay = React.useContext(OverlayContext);
  if (overlay === null) {
    throw new Error(`Cannot find parent Overlay, did you forget OverlayProvider ?`);
  }
  return overlay;
}

export function useOverlayManager(): OverlayManager {
  const manager = React.useContext(OverlayManagerContext);
  if (manager === null) {
    throw new Error(`Cannot find OverlayManager, did you forget OverlayProvider ?`);
  }
  return manager;
}
