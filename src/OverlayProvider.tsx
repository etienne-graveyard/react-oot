import React from 'react';
import { OverlayManager } from './OverlayManager';
import { OverlayContext, OverlayManagerContext } from './OverlayContext';

interface Props {}

export const OverlayProvider: React.FC<Props> = ({ children }) => {
  const [manager] = React.useState(() => OverlayManager.create());

  const handleKeydown = React.useCallback(
    (event: KeyboardEvent) => {
      const ESCAPE = 27;
      if (event.which === ESCAPE) {
        manager.dispatchEscape(event);
      }
    },
    [manager]
  );

  const handleDocumentClick = React.useCallback(
    (event: MouseEvent) => {
      // delay document click to after react has handle click
      // this allow us to check is overlay has changed because of the click
      // and in that case we ignore the outside click.
      window.setTimeout(() => {
        manager.dispatchDocumentClick(event);
      }, 0);
    },
    [manager]
  );

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [handleDocumentClick, handleKeydown]);

  return (
    <OverlayManagerContext.Provider value={manager}>
      <OverlayContext.Provider value={manager.getRootToken()}>
        {children}
      </OverlayContext.Provider>
    </OverlayManagerContext.Provider>
  );
};
