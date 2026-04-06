import { renderMarkdown } from "../lib/markdown";
import type { EntryRecord } from "../types";

interface EntryPageProps {
  entry: EntryRecord;
}

export function EntryPage({ entry }: EntryPageProps) {
  const collectionLabel =
    entry.collectionId.charAt(0).toUpperCase() + entry.collectionId.slice(1);

  return (
    <main className="page-main">
      <article className="entry-page">
        <div className="entry-page__header">
          <a className="entry-page__backlink" href={`/#${entry.collectionId}`}>
            <span aria-hidden="true" className="entry-page__backlink-arrow">
              ←
            </span>
            <span>Back to {collectionLabel}</span>
          </a>
          <p className="section-kicker">{entry.kicker ?? entry.meta}</p>
          <h1 className="entry-page__title">{entry.title}</h1>
          <p className="entry-page__meta">{entry.meta}</p>
          <p className="entry-page__summary">{entry.summary}</p>
        </div>

        <div
          className="entry-page__content"
          dangerouslySetInnerHTML={renderMarkdown(entry.content)}
        />
      </article>
    </main>
  );
}
