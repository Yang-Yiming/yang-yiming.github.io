import { useEffect, useRef } from "react";
import { renderEntryHtml } from "../lib/html";
import { renderEntryMarkdown } from "../lib/entryMarkdown";
import type { EntryRecord } from "../types";

interface EntryPageProps {
  entry: EntryRecord;
}

export function EntryPage({ entry }: EntryPageProps) {
  const collectionLabel =
    entry.collectionId.charAt(0).toUpperCase() + entry.collectionId.slice(1);
  const embeddedHref = entry.externalHref ?? entry.source;
  const shouldEmbed = entry.open === "iframe" && embeddedHref;
  const shouldShowNativeLink =
    (entry.open === "native" || entry.kind === "link") && embeddedHref;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!shouldEmbed) return;
    if (iframeRef.current) {
      iframeRef.current.style.height = "2000px";
    }
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "iframe-height" && iframeRef.current) {
        iframeRef.current.style.height = `${e.data.height}px`;
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [shouldEmbed]);

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
        >
          {entry.kind === "markdown" && entry.content ? (
            <div
              dangerouslySetInnerHTML={renderEntryMarkdown(
                entry.content,
                entry.assetBase,
              )}
            />
          ) : null}

          {entry.kind === "html" && entry.open === "entry" && entry.content ? (
            <div
              dangerouslySetInnerHTML={renderEntryHtml(
                entry.content,
                entry.assetBase,
              )}
            />
          ) : null}

          {shouldEmbed ? (
            <iframe
              ref={iframeRef}
              className="entry-page__frame"
              src={embeddedHref}
              title={entry.title}
              scrolling="no"
            />
          ) : null}

          {shouldShowNativeLink ? (
            <p>
              <a href={embeddedHref}>Open {entry.title}</a>
            </p>
          ) : null}
        </div>
      </article>
    </main>
  );
}
