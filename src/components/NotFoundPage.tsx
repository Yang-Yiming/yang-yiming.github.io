export function NotFoundPage() {
  return (
    <main className="page-main">
      <section className="entry-page">
        <div className="entry-page__header">
          <p className="section-kicker">404</p>
          <h1 className="entry-page__title">This page does not exist.</h1>
          <p className="entry-page__summary">
            The route may be wrong, or the markdown entry may have been renamed.
          </p>
          <a className="entry-page__backlink" href="/">
            Return home
          </a>
        </div>
      </section>
    </main>
  );
}
