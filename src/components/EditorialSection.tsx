import { renderMarkdown } from "../lib/markdown";
import type { SectionContent } from "../types";

interface EditorialSectionProps {
  section: SectionContent;
  ghostFaceSwapEnabled?: boolean;
  onGhostFaceSwapChange?: (enabled: boolean) => void;
}

export function EditorialSection({
  section,
  ghostFaceSwapEnabled = false,
  onGhostFaceSwapChange,
}: EditorialSectionProps) {
  const hasItems = Boolean(section.items?.length);
  const showsGhostControl = section.id === "fun" && onGhostFaceSwapChange;

  return (
    <section className="editorial-section section-frame" id={section.id}>
      <div className="section-header">
        <div className="section-heading">
          <p className="section-kicker" data-section-anchor={section.id}>
            {section.kicker}
          </p>
          <a
            aria-label={`Link to ${section.navLabel} section`}
            className="section-heading-link"
            href={`#${section.id}`}
          >
            <span aria-hidden="true" className="section-heading-link__anchor">
              #
            </span>
            <h2
              className="section-title"
              dangerouslySetInnerHTML={renderMarkdown(section.title)}
            />
          </a>
        </div>

        <div className="section-body">
          <div
            className="section-intro"
            dangerouslySetInnerHTML={renderMarkdown(section.intro)}
          />
          {showsGhostControl ? (
            <label className="fun-toggle">
              <span className="fun-toggle__copy">
                <span className="fun-toggle__title">Ghost face shuffle</span>
                <span className="fun-toggle__description">
                  Let the little ghost borrow a random face sometimes.
                </span>
              </span>
              <input
                checked={ghostFaceSwapEnabled}
                className="fun-toggle__input"
                onChange={(event) => {
                  onGhostFaceSwapChange(event.currentTarget.checked);
                }}
                type="checkbox"
              />
              <span className="fun-toggle__track" aria-hidden="true">
                <span className="fun-toggle__thumb"></span>
              </span>
            </label>
          ) : null}
        </div>
      </div>

      {hasItems ? (
        <div className="section-list">
          {section.items?.map((item) => (
            item.href ? (
              <a key={item.title} className="list-row list-row--link" href={item.href}>
                <p className="list-row__meta">{item.meta}</p>
                <div className="list-row__body">
                  <h3
                    className="list-row__title"
                    dangerouslySetInnerHTML={renderMarkdown(item.title)}
                  />
                  <div
                    className="list-row__description"
                    dangerouslySetInnerHTML={renderMarkdown(item.description)}
                  />
                </div>
              </a>
            ) : (
              <article key={item.title} className="list-row">
                <p className="list-row__meta">{item.meta}</p>
                <div className="list-row__body">
                  <h3
                    className="list-row__title"
                    dangerouslySetInnerHTML={renderMarkdown(item.title)}
                  />
                  <div
                    className="list-row__description"
                    dangerouslySetInnerHTML={renderMarkdown(item.description)}
                  />
                </div>
              </article>
            )
          ))}
        </div>
      ) : null}
    </section>
  );
}
