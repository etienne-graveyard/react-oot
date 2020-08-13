import { OverlayToken } from './OverlayToken';

export type Unregister = () => void;

interface StackItem {
  token: OverlayToken;
  parent: OverlayToken;
  setZIndex: (zIndex: number) => void;
  canEscapeKeyClose: boolean;
  canOutsideClickClose: boolean;
  container: HTMLDivElement;
  onClose?: (event: MouseEvent | KeyboardEvent) => void;
}

export interface OverlayManager {
  getRootToken(): OverlayToken;
  getNextZIndex(): number;
  register(
    current: OverlayToken,
    parent: OverlayToken,
    setZIndex: (zIndex: number) => void,
    container: HTMLDivElement,
    canEscapeKeyClose: boolean,
    canOutsideClickClose: boolean,
    onClose?: (event: MouseEvent | KeyboardEvent) => void
  ): Unregister;
  dispatchEscape(event: KeyboardEvent): void;
  dispatchDocumentClick(event: MouseEvent): void;
  hasChanged(): boolean;
}

export const OverlayManager = {
  create: createOverlayManager,
};

function createOverlayManager(): OverlayManager {
  const rootToken: OverlayToken = OverlayToken.create('root');
  let stack: Array<StackItem> = [];
  let prevStack: Array<StackItem> = [];
  let orphans: Array<Array<StackItem>> = [];

  let updateRequested: boolean = false;

  function onStackChange() {
    if (updateRequested === false) {
      window.setTimeout(() => {
        updateRequested = false;
        stack.forEach((layer, index) => {
          layer.setZIndex(50 + index * 10);
        });
        prevStack = [...stack];
        if (orphans.length !== 0) {
          console.warn(`There should be no orphan after React is done !!`);
        }
      }, 0);
      updateRequested = true;
    }
  }

  function register(
    current: OverlayToken,
    parent: OverlayToken,
    setZIndex: (zIndex: number) => void,
    container: HTMLDivElement,
    canEscapeKeyClose: boolean,
    canOutsideClickClose: boolean,
    onClose?: (event: MouseEvent | KeyboardEvent) => void
  ): Unregister {
    const item: StackItem = {
      token: current,
      parent,
      setZIndex,
      container,
      canEscapeKeyClose,
      canOutsideClickClose,
      onClose,
    };

    const alreadyMounted = stack.find(layer => layer.token === current);
    // already in stack
    if (alreadyMounted) {
      // update it
      Object.assign(alreadyMounted, item);
      onStackChange();
    } else {
      const parentIsRoot = parent === rootToken;
      const parentMounted = stack.find(layer => layer.token === parent);
      if (parentMounted || parentIsRoot) {
        stack.push(item);
        // resolve orphan
        orphans = orphans.filter(orphanStack => {
          const first = orphanStack[0];
          if (first.parent === current) {
            stack.push(...orphanStack);
            return false;
          }
          return true;
        });
        onStackChange();
      } else {
        const parentOrphanStack = orphans.find(orphanStack =>
          orphanStack.find(layer => layer.token === parent)
        );
        // parent is orphan ? (not supposed to append ?)
        if (parentOrphanStack) {
          parentOrphanStack.push(item);
        } else {
          const currentOrphanStack: Array<StackItem> = [item];
          orphans.push(currentOrphanStack);
          // if we found orphan with parent === current we move them
          orphans = orphans.filter(orphanStack => {
            const first = orphanStack[0];
            if (first.parent === current) {
              currentOrphanStack.push(...orphanStack);
              return false;
            }
            return true;
          });
        }
      }
    }

    function unregister(): void {
      let deleteQueue = [current];
      let nextDeleteQueue: Array<OverlayToken> = [];
      function onItem(item: StackItem): boolean {
        const shouldDeelete = deleteQueue.indexOf(item.token) >= 0;
        if (shouldDeelete) {
          nextDeleteQueue.push(item.token);
          return false;
        }
        return true;
      }

      while (deleteQueue.length > 0) {
        nextDeleteQueue = [];
        // eslint-disable-next-line no-loop-func
        stack = stack.filter(onItem);
        orphans = orphans.filter(orphanStack => {
          const nextStack = orphanStack.filter(onItem);
          return nextStack.length > 0;
        });
        deleteQueue = nextDeleteQueue;
      }
      onStackChange();
    }

    return unregister;
  }

  function getNextZIndex(): number {
    return stack.length + 1;
  }

  function dispatchEscape(event: KeyboardEvent): void {
    if (prevStack.length === 0) {
      return;
    }
    function handle(index: number): void {
      if (index < 0) {
        return;
      }
      const item = prevStack[index];
      if (item.canEscapeKeyClose === false) {
        return;
      }
      const onClose = item.onClose;
      if (!onClose) {
        return handle(index - 1);
      }
      if (updateRequested) {
        const inPrev = prevStack.find(layer => layer.token === item.token) === undefined;
        const inCurrent = stack.find(layer => layer.token === item.token) === undefined;
        if (inPrev !== inCurrent) {
          // if the stack has changed and the overlay supposed to handle the change
          // has changed we ignore the click
          return;
        }
      }
      onClose(event);
      if (event.defaultPrevented === false) {
        return handle(index - 1);
      }
    }
    handle(prevStack.length - 1);
  }

  function dispatchDocumentClick(event: MouseEvent): void {
    // delay document click to after react has handle click
    // we do this to handle the case where the click would close a stack (with a setState)
    // and we don't want the outside click to have action on that stack
    window.setTimeout(() => {
      handleDocumentClick(event);
    }, 0);
  }

  function handleDocumentClick(event: MouseEvent): void {
    // document click is delayed with a setTimeout 0
    // so we use prevStack to ignore new overlays added by the click
    if (prevStack.length === 0) {
      return;
    }
    function handle(index: number): void {
      if (index < 0) {
        return;
      }
      const target = event.target;
      if (!target) {
        return;
      }
      const item = prevStack[index];
      // const itemRemoved = stack.find(i => i.token === item.token);
      const stillExist = document.contains(target as any);
      if (stillExist === false) {
        return;
      }
      const isInsideClick = target === item.container || item.container.contains(target as any);
      if (isInsideClick) {
        return;
      }
      if (item.canOutsideClickClose === false) {
        return;
      }
      const onClose = item.onClose;
      if (!onClose) {
        return handle(index - 1);
      }
      if (updateRequested) {
        const inPrev = prevStack.find(layer => layer.token === item.token) === undefined;
        const inCurrent = stack.find(layer => layer.token === item.token) === undefined;
        if (inPrev !== inCurrent) {
          // if the stack has changed and the overlay supposed to handle the change
          // has changed we ignore the click
          return;
        }
      }
      onClose(event);
      // if e.preventDefault() id stop the close event
      if (event.defaultPrevented === false) {
        return handle(index - 1);
      }
    }
    handle(prevStack.length - 1);
  }

  const manager: OverlayManager = {
    getRootToken: () => rootToken,
    getNextZIndex,
    register,
    dispatchEscape,
    dispatchDocumentClick,
    hasChanged: () => updateRequested,
  };

  return manager;
}
