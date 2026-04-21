import { useEffect, useMemo, useState } from "react";
import { sections, siteMeta } from "../content";
import { renderMarkdown } from "../lib/markdown";
import type { SiteLink } from "../types";

const heroRotationDelay = 4800;

function LinkIcon({ icon }: { icon?: SiteLink["icon"] }) {
  if (icon === "github") {
    return (
      <svg
        aria-hidden="true"
        className="hero__link-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18c-4 1.5-4-2-6-2" />
        <path d="M15 21v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19.1 3.77 5.07 5.07 0 0 0 19 1s-1.18-.35-4 1.48a13.38 13.38 0 0 0-6 0C6.18.65 5 1 5 1a5.07 5.07 0 0 0-.1 2.77A5.44 5.44 0 0 0 3.5 7.52c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 17.13V21" />
      </svg>
    );
  }

  if (icon === "email") {
    return (
      <svg
        aria-hidden="true"
        className="hero__link-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  return null;
}

export function Hero() {
  const home = sections[0];
  const heroImages = siteMeta.heroImages;
  const hasLocation = Boolean(siteMeta.location.trim());
  const hasNotes = Boolean(home.items?.length);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [failedSources, setFailedSources] = useState<string[]>([]);

  const availableImages = useMemo(
    () => heroImages.filter((image) => !failedSources.includes(image.src)),
    [failedSources, heroImages],
  );

  useEffect(() => {
    if (availableImages.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentImageIndex(
        (currentIndex) => (currentIndex + 1) % availableImages.length,
      );
    }, heroRotationDelay);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [availableImages.length]);

  useEffect(() => {
    if (currentImageIndex >= availableImages.length) {
      setCurrentImageIndex(0);
    }
  }, [availableImages.length, currentImageIndex]);

  function showNextImage() {
    if (availableImages.length < 2) {
      return;
    }

    setCurrentImageIndex(
      (currentIndex) => (currentIndex + 1) % availableImages.length,
    );
  }

  function handleImageError(src: string) {
    setFailedSources((sources) =>
      sources.includes(src) ? sources : [...sources, src],
    );
  }

  const currentImage = availableImages[currentImageIndex];

  return (
    <section
      className={`hero section-frame${hasNotes ? "" : " hero--compact"}`}
      id="home"
    >
      <div className="hero__masthead">
        <div className="hero__lead">
          <p className="section-kicker" data-section-anchor={home.id}>
            {home.kicker}
          </p>
          <p className="hero__availability">{siteMeta.accentLabel}</p>
          <a
            aria-label={`Link to ${home.navLabel} section`}
            className="section-heading-link section-heading-link--hero"
            href={`#${home.id}`}
          >
            <span aria-hidden="true" className="section-heading-link__anchor">
              #
            </span>
            <h1
              className="hero__title"
              dangerouslySetInnerHTML={renderMarkdown(home.title)}
            />
          </a>
          <div
            className="hero__summary"
            dangerouslySetInnerHTML={renderMarkdown(siteMeta.summary)}
          />
        </div>

        {currentImage ? (
          <button
            aria-label="Show next hero image"
            className="hero-media"
            type="button"
            onClick={showNextImage}
          >
            <div className="hero-media__frame">
              <img
                key={currentImage.src}
                alt={currentImage.alt}
                className="hero-media__image"
                src={currentImage.src}
                onError={() => handleImageError(currentImage.src)}
              />
            </div>
            <div className="hero-media__meta">
              <span>{currentImage.caption}</span>
              <span>
                {String(currentImageIndex + 1).padStart(2, "0")}/
                {String(availableImages.length).padStart(2, "0")}
              </span>
            </div>
          </button>
        ) : (
          <div aria-hidden="true" className="hero-emoji">
            <span className="hero-emoji__symbol">🥑</span>
          </div>
        )}
      </div>

      <div className={`hero__columns${hasNotes ? "" : " hero__columns--compact"}`}>
        <div className="hero__column">
          <p className="section-kicker">Overview</p>
          <div
            className="hero__body"
            dangerouslySetInnerHTML={renderMarkdown(home.intro)}
          />
          {hasLocation ? (
            <div
              className="hero__body"
              dangerouslySetInnerHTML={renderMarkdown(siteMeta.location)}
            />
          ) : null}
        </div>

        <div className="hero__column hero__column--index">
          <p className="section-kicker">Quick entry</p>
          <div className="hero__index">
            {sections.slice(1, 4).map((section) => (
              <a
                key={section.id}
                className="hero__index-link"
                href={`#${section.id}`}
              >
                <span>
                  {section.navLabel}
                  <span className="hero__index-arrow" aria-hidden="true"> →</span>
                </span>
                <span>{section.kicker}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="hero__column hero__column--links">
          <p className="section-kicker">Elsewhere</p>
          <div className="hero__links">
            {siteMeta.links.map((link) => (
              <a
                key={link.label}
                className="hero__link"
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="hero__link-label">
                  <LinkIcon icon={link.icon} />
                  <span>{link.label}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {hasNotes ? (
        <div className="hero__notes" aria-label="Home highlights">
          {home.items?.map((item) => (
            <article key={item.title} className="list-row">
              <p className="list-row__meta">{item.meta}</p>
              <div className="list-row__body">
                <h2
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
      ) : null}
    </section>
  );
}
