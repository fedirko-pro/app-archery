import i18n from 'i18next';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type MissingKey = {
  ns: string;
  key: string;
  lng: string;
  count: number;
  lastAt: number;
};

function useMissingKeys() {
  const [missing, setMissing] = useState<Record<string, MissingKey>>({});
  const keyFn = (lng: string, ns: string, key: string) => `${lng}::${ns}::${key}`;

  useEffect(() => {
    const handler = (lngs: string | string[], ns: string, key: string) => {
      const lng = Array.isArray(lngs) ? lngs[0] : lngs;
      const id = keyFn(lng, ns, key);
      setMissing((prev) => {
        const existing = prev[id];
        const next: MissingKey = existing
          ? { ...existing, count: existing.count + 1, lastAt: Date.now() }
          : { ns, key, lng, count: 1, lastAt: Date.now() };
        return { ...prev, [id]: next };
      });
    };
    i18n.on('missingKey', handler);
    return () => {
      i18n.off('missingKey', handler);
    };
  }, []);

  const list = useMemo(
    () => Object.values(missing).sort((a, b) => b.lastAt - a.lastAt),
    [missing],
  );

  return { list, clear: () => setMissing({}) };
}

const badgeStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 16,
  right: 16,
  zIndex: 9999,
  background: '#111',
  color: '#fff',
  borderRadius: 20,
  padding: '6px 10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  cursor: 'pointer',
  fontSize: 12,
};

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 56,
  right: 16,
  width: 360,
  maxHeight: '60vh',
  overflow: 'auto',
  zIndex: 9999,
  background: '#1e1e1e',
  color: '#e6e6e6',
  borderRadius: 8,
  padding: 12,
  boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
  fontSize: 12,
};

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: '8px 0',
};

const buttonStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#7fbfff',
  border: '1px solid #3a6ea5',
  borderRadius: 4,
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: 11,
};

export default function I18nDevOverlay() {
  const { list, clear } = useMissingKeys();
  const [open, setOpen] = useState<boolean>(() => localStorage.getItem('i18nDevOverlayOpen') === '1');
  const badgeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key.toLowerCase() === 'i')) {
        setOpen((prev) => {
          const next = !prev;
          try { localStorage.setItem('i18nDevOverlayOpen', next ? '1' : '0'); } catch {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (import.meta.env.PROD) return null;

  const copySnippet = async (_ns: string, key: string) => {
    const snippet = `"${key}": "TODO"`;
    try {
      await navigator.clipboard.writeText(snippet);
    } catch {}
  };

  return (
    <>
      <div ref={badgeRef} style={badgeStyle} onClick={() => setOpen(!open)}>
        i18n {list.length > 0 ? `missing: ${list.length}` : 'ok'} (Alt+I)
      </div>
      {open && (
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>Missing translation keys</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={buttonStyle} onClick={clear}>Clear</button>
              <button style={buttonStyle} onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
          {list.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No missing keys detected.</div>
          ) : (
            list.map((m) => (
              <div key={`${m.lng}:${m.ns}:${m.key}`} style={rowStyle}>
                <div><strong>key:</strong> {m.key}</div>
                <div><strong>ns:</strong> {m.ns} <strong>lng:</strong> {m.lng} <strong>count:</strong> {m.count}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <button style={buttonStyle} onClick={() => copySnippet(m.ns, m.key)}>Copy JSON</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}


