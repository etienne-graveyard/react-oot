import React from 'react';
import ReactDOM from 'react-dom';
import { Overlay, OverlayProvider } from '../src';

const DynamicOverlay: React.FC<{ name: string }> = ({ name }) => {
  const [show, setShow] = React.useState(false);

  return (
    <div>
      <span>{name}</span>
      <button onClick={() => setShow(p => !p)}>Toggle</button>
      {show && (
        <ClosableOverlay debugName={name}>
          <DynamicOverlay name={name + '.1'} />
        </ClosableOverlay>
      )}
    </div>
  );
};

const ClosableOverlay: React.FC<{ debugName: string }> = ({
  debugName,
  children,
}) => {
  const [open, setOpen] = React.useState(true);
  const [escape, setEscape] = React.useState(true);
  const [onClose, setOnClose] = React.useState(true);
  const [outside, setOutside] = React.useState(true);
  const [prevent, setPrevent] = React.useState(true);

  if (!open) {
    return null;
  }
  return (
    <Overlay
      canEscapeKeyClose={escape}
      canOutsideClickClose={outside}
      debugName={debugName}
      onClose={
        onClose
          ? e => {
              setOpen(false);
              if (prevent) {
                e.preventDefault();
              }
            }
          : undefined
      }
      render={zIndex => (
        <div
          style={{
            position: 'fixed',
            width: 300,
            height: 100,
            boxSizing: 'border-box',
            background: 'white',
            border: '1px solid blue',
            right: 0,
            bottom: zIndex * 10 - 100,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button onClick={() => setEscape(p => !p)}>
            canEscapeKeyClose: {String(escape)}
          </button>
          <button onClick={() => setOutside(p => !p)}>
            canOutsideClickClose: {String(outside)}
          </button>
          <button onClick={() => setOnClose(p => !p)}>
            onClose: {String(onClose)}
          </button>
          <button onClick={() => setPrevent(p => !p)}>
            preventDefault onClose: {String(prevent)}
          </button>
          <button onClick={() => setOpen(false)}>Close</button>
          {children}
        </div>
      )}
    />
  );
};

const OverlayDemo: React.FC = () => {
  const [show2, setShow2] = React.useState(false);
  const [show1, setShow1] = React.useState(false);

  return (
    <div>
      <h1>Overlay</h1>
      <button onClick={() => setShow1(p => !p)}>Toggle 1</button>
      <button onClick={() => setShow2(p => !p)}>Toggle 2</button>
      {show1 && (
        <ClosableOverlay debugName="1">
          <span>Overlay 1</span>
          <ClosableOverlay debugName="1.1">
            <span>Overlay 1.1</span>
          </ClosableOverlay>
          <ClosableOverlay debugName="1.2">
            <span>Overlay 1.2</span>
          </ClosableOverlay>
        </ClosableOverlay>
      )}

      {show2 && (
        <ClosableOverlay debugName="2">
          <span>Overlay 2</span>
          <ClosableOverlay debugName="2.1">
            <span>Overlay 2.1</span>
            <ClosableOverlay debugName="2.1.1">
              <span>Overlay 2.1.1</span>
              <ClosableOverlay debugName="2.1.1.1">
                <span>Overlay 2.1.1.1</span>
              </ClosableOverlay>
            </ClosableOverlay>
          </ClosableOverlay>
        </ClosableOverlay>
      )}

      <DynamicOverlay name="dynamic" />
      <button
        onClick={() => {
          setShow1(p => false);
          setShow2(p => false);
        }}
      >
        Close all
      </button>
    </div>
  );
};

ReactDOM.render(
  <OverlayProvider>
    <OverlayDemo />
  </OverlayProvider>,
  document.getElementById('root')
);
