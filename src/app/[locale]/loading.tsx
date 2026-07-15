export default function LocaleLoading() {
  return (
    <main aria-busy="true" aria-label="QULTURE loading" className="route-loading">
      <span className="q-meta">QULTURE / LOADING</span>
      <div aria-hidden="true" className="route-loading__line" />
      <div aria-hidden="true" className="route-loading__line route-loading__line--short" />
    </main>
  );
}
