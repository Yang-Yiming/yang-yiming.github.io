import { useEffect, useMemo, useState } from "react";
import { sections, siteMeta } from "./content";
import type { SectionContent, SectionId } from "./types";

const observerOffset = "-35% 0px -45% 0px";

function App() {
  const sectionIds = useMemo(
    () => sections.map((section) => section.id),
    [],
  );
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
            (left, right) =>
              right.intersectionRatio - left.intersectionRatio,
          );

        if (visibleEntries.length > 0) {
          setActiveSection(
            visibleEntries[0].target.id as SectionId,
          );
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

function SiteHeader({
  activeSection,
}: {
  activeSection: SectionId;
}) {
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

  return (
    <section className="hero section-frame" id="home">
      <div className="hero__lead">
        <p className="section-kicker">{home.kicker}</p>
        <p className="hero__availability">{siteMeta.accentLabel}</p>
        <h1 className="hero__title">{home.title}</h1>
        <p className="hero__summary">{siteMeta.summary}</p>
      </div>

      <div className="hero__columns">
        <div className="hero__column">
          <p className="section-kicker">Overview</p>
          <p className="hero__body">{home.intro}</p>
          <p className="hero__body">{siteMeta.location}</p>
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
              <h2 className="list-row__title">{item.title}</h2>
              <p className="list-row__description">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EditorialSection({
  section,
}: {
  section: SectionContent;
}) {
  return (
    <section className="editorial-section section-frame" id={section.id}>
      <div className="section-heading">
        <p className="section-kicker">{section.kicker}</p>
        <h2 className="section-title">{section.title}</h2>
      </div>

      <div className="section-body">
        <p className="section-intro">{section.intro}</p>

        <div className="section-list">
          {section.items?.map((item) => (
            <article key={item.title} className="list-row">
              <p className="list-row__meta">{item.meta}</p>
              <div className="list-row__body">
                <h3 className="list-row__title">{item.title}</h3>
                <p className="list-row__description">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default App;
