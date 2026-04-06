import { renderMarkdown } from "../lib/markdown";
import type { SectionContent } from "../types";

interface EditorialSectionProps {
  section: SectionContent;
}

export function EditorialSection({ section }: EditorialSectionProps) {
  return (
    <section className="editorial-section section-frame" id={section.id}>
      <div className="section-header">
        <div className="section-heading">
          <p className="section-kicker">{section.kicker}</p>
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
        </div>
      </div>

      <div className="section-list">
        {section.items?.map((item) => (
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
        ))}
      </div>
    </section>
  );
}
