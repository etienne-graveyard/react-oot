import React from 'react';
import ReactDOM from 'react-dom';
import { OverlayContext } from './OverlayContext';
import { useOverlay } from './useOverlay';
import { usePortal } from './usePortal';

interface Props {
  debugName?: string;
  canEscapeKeyClose?: boolean;
  canOutsideClickClose?: boolean;
  autoFocus?: boolean;
  render?: (zIndex: number) => React.ReactNode;
  onClose?: (event: MouseEvent | KeyboardEvent) => void;
}

export const Overlay: React.FC<Props> = ({
  children,
  debugName,
  render,
  onClose,
  canEscapeKeyClose,
  canOutsideClickClose,
  autoFocus,
}) => {
  const portalRef = React.useRef(document.createElement('div'));
  const { token, zIndex } = useOverlay(portalRef.current, {
    debugName,
    onClose,
    canEscapeKeyClose,
    canOutsideClickClose,
  });
  usePortal({
    zIndex,
    autoFocus,
    ref: portalRef,
  });

  return ReactDOM.createPortal(
    <OverlayContext.Provider value={token}>
      {render ? render(zIndex) : children}
    </OverlayContext.Provider>,
    portalRef.current
  );
};
