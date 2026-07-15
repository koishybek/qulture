export default function AdminLoading() {
  return (
    <main aria-busy="true" aria-label="QULTURE control room loading" className="route-loading">
      <span className="q-meta">QULTURE / CONTROL ROOM</span>
      <div aria-hidden="true" className="route-loading__line" />
      <div aria-hidden="true" className="route-loading__line route-loading__line--short" />
    </main>
  );
}
