import React from 'react';

interface Options {
  zIndex: number;
  autoFocus?: boolean;
  ref?: React.MutableRefObject<HTMLDivElement>;
}

export function usePortal(options: Options) {
  const { zIndex, ref, autoFocus = false } = options;
  const localPortal = React.useRef(document.createElement('div'));
  const portal = ref ? ref : localPortal;

  React.useEffect(() => {
    const elToMountTo = document.body;
    const node = portal.current;
    elToMountTo.appendChild(node);

    return () => {
      elToMountTo.removeChild(node);
    };
  }, [portal]);

  React.useLayoutEffect(() => {
    const node = portal.current;
    node.style.position = 'fixed';
    node.style.top = '0';
    node.style.left = '0';
    node.style.zIndex = zIndex.toString();
  }, [portal, zIndex]);

  React.useEffect(() => {
    const node = portal.current;
    if (autoFocus) {
      node.focus();
    }
  }, [autoFocus, portal]);

  return portal;
}
