import './AppShellSkeleton.scss';

/** Placeholder shell shown before client hydration to avoid blank first paint. */
export function AppShellSkeleton() {
  return (
    <div className="app-shell-skeleton" aria-hidden="true">
      <header className="app-shell-skeleton__header" />
      <main className="app-shell-skeleton__main" />
      <footer className="app-shell-skeleton__footer" />
    </div>
  );
}
