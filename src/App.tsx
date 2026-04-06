import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { sections, siteMeta } from "./content";
import type { SectionContent, SectionId } from "./types";

const observerOffset = "-35% 0px -45% 0px";
const heroRotationDelay = 4800;

marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(markdown: string) {
  const rawHtml = marked.parse(markdown) as string;
  return {
    __html: DOMPurify.sanitize(rawHtml),
  };
}

function App() {
  const sectionIds = useMemo(() => sections.map((section) => section.id), []);
  const [activeSection, setActiveSection] = useState<SectionId>("home");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          );

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id as SectionId);
        }
      },
      {
        rootMargin: observerOffset,
        threshold: [0.2, 0.35, 0.5, 0.7],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return (
    <div className="page-shell">
      <SiteHeader activeSection={activeSection} />
      <main className="page-main">
        <Hero />
        {sections
          .filter((section) => section.id !== "home")
          .map((section) => (
            <EditorialSection key={section.id} section={section} />
          ))}
      </main>
    </div>
  );
}

function SiteHeader({ activeSection }: { activeSection: SectionId }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-mark" href="#home">
          <span className="site-mark__name">{siteMeta.name}</span>
          <span className="site-mark__role">{siteMeta.role}</span>
        </a>

        <nav aria-label="Section navigation" className="site-nav">
          {sections.map((section) => {
            const isActive = section.id === activeSection;

            return (
              <a
                key={section.id}
                className={`site-nav__link${isActive ? " is-active" : ""}`}
                href={`#${section.id}`}
              >
                {section.navLabel}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const home = sections[0];
  const heroImages = siteMeta.heroImages;
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
    <section className="hero section-frame" id="home">
      <div className="hero__masthead">
        <div className="hero__lead">
          <p className="section-kicker">{home.kicker}</p>
          <p className="hero__availability">{siteMeta.accentLabel}</p>
          <h1
            className="hero__title"
            dangerouslySetInnerHTML={renderMarkdown(home.title)}
          />
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

      <div className="hero__columns">
        <div className="hero__column">
          <p className="section-kicker">Overview</p>
          <div
            className="hero__body"
            dangerouslySetInnerHTML={renderMarkdown(home.intro)}
          />
          <div
            className="hero__body"
            dangerouslySetInnerHTML={renderMarkdown(siteMeta.location)}
          />
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
                <span>{section.navLabel}</span>
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
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

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
    </section>
  );
}

function EditorialSection({ section }: { section: SectionContent }) {
  return (
    <section className="editorial-section section-frame" id={section.id}>
      <div className="section-header">
        <div className="section-heading">
          <p className="section-kicker">{section.kicker}</p>
          <h2
            className="section-title"
            dangerouslySetInnerHTML={renderMarkdown(section.title)}
          />
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

export default App;
