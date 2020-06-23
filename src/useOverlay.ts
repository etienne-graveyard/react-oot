import React from 'react';
import { OverlayToken } from './OverlayToken';
import { useOverlayParent, useOverlayManager } from './OverlayContext';
import { Unregister } from './OverlayManager';

interface Result {
  token: OverlayToken;
  zIndex: number;
}

interface Options {
  debugName?: string;
  canEscapeKeyClose?: boolean;
  canOutsideClickClose?: boolean;
  onClose?: (event: MouseEvent | KeyboardEvent) => void;
}

export function useOverlay(container: HTMLDivElement, options: Options = {}): Result {
  const {
    debugName = '',
    canEscapeKeyClose = true,
    canOutsideClickClose = true,
    onClose,
  } = options;
  const parent = useOverlayParent();
  const manager = useOverlayManager();
  const [token] = React.useState(() => OverlayToken.create(debugName));
  const [zIndex, setZIndex] = React.useState(() => manager.getNextZIndex());
  const unregisterRef = React.useRef<Unregister | null>(null);

  React.useEffect(() => {
    const unregister = manager.register(
      token,
      parent,
      setZIndex,
      container,
      canEscapeKeyClose,
      canOutsideClickClose,
      onClose
    );
    unregisterRef.current = unregister;
  }, [canEscapeKeyClose, canOutsideClickClose, container, manager, onClose, parent, token]);

  React.useEffect(() => {
    return () => {
      if (unregisterRef.current) {
        unregisterRef.current();
      }
    };
  }, []);

  return {
    token,
    zIndex,
  };
}
