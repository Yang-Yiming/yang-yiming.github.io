import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { sections, siteMeta } from "./content";
import type { GitHubProject, SectionContent, SectionId } from "./types";

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

function getRepoLabel(href: string) {
  try {
    const { pathname } = new URL(href);
    return pathname.replace(/^\/+/, "") || href;
  } catch {
    return href;
  }
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
            section.id === "projects" ? (
              <ProjectsSection key={section.id} section={section} />
            ) : (
              <EditorialSection key={section.id} section={section} />
            )
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

function ProjectsSection({ section }: { section: SectionContent }) {
  return (
    <section className="editorial-section section-frame" id={section.id}>
      <div className="section-header section-header--projects">
        <div className="section-heading">
          <p className="section-kicker">{section.kicker}</p>
          <h2
            className="section-title"
            dangerouslySetInnerHTML={renderMarkdown(section.title)}
          />
        </div>

        <div className="section-body">
          {section.sourceLabel ? (
            <p className="section-source-label">{section.sourceLabel}</p>
          ) : null}
          <div
            className="section-intro"
            dangerouslySetInnerHTML={renderMarkdown(section.intro)}
          />
        </div>
      </div>

      <div className="projects-groups">
        {section.projectGroups?.map((group) => (
          <div key={group.title} className="projects-group">
            <div className="projects-group__header">
              <p className="projects-group__title">{group.title}</p>
            </div>

            <div className="projects-group__list">
              {group.items.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: GitHubProject }) {
  const repoLabel = getRepoLabel(project.href);

  return (
    <a
      className="project-card"
      href={project.href}
      target="_blank"
      rel="noreferrer"
    >
      <div className="project-card__header">
        <div className="project-card__heading">
          <span className="project-card__icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" focusable="false">
              <path
                d="M2.5 2.75A1.75 1.75 0 0 1 4.25 1h2.1c.38 0 .74.151 1.01.419l.82.82c.094.094.221.146.354.146h3.22A1.75 1.75 0 0 1 13.5 4.135v7.615A1.75 1.75 0 0 1 11.75 13.5h-7.5A1.75 1.75 0 0 1 2.5 11.75Zm1.75-.25a.25.25 0 0 0-.25.25v9c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25V4.135a.25.25 0 0 0-.25-.25H8.53a1.93 1.93 0 0 1-1.414-.586l-.82-.82a.18.18 0 0 0-.127-.053Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <h3 className="project-card__title">{repoLabel}</h3>
        </div>
        {project.visibility ? (
          <span className="project-card__badge">{project.visibility}</span>
        ) : null}
      </div>

      <div className="project-card__body">
        <div
          className="project-card__description"
          dangerouslySetInnerHTML={renderMarkdown(project.description)}
        />
      </div>

      <div className="project-card__footer">
        <div className="project-card__meta">
          {project.language ? (
            <span className="project-card__meta-item">
              <span className="project-card__language-dot" aria-hidden="true" />
              {project.language}
            </span>
          ) : null}
          {project.stars ? (
            <span className="project-card__meta-item">
              <span className="project-card__star" aria-hidden="true">
                <svg viewBox="0 0 16 16" focusable="false">
                  <path
                    d="M8 .25a.75.75 0 0 1 .673.418l1.88 3.81 4.205.611a.75.75 0 0 1 .416 1.279l-3.043 2.966.718 4.188a.75.75 0 0 1-1.088.79L8 12.336l-3.761 1.977a.75.75 0 0 1-1.088-.79l.718-4.188L.826 6.37a.75.75 0 0 1 .416-1.279l4.205-.611 1.88-3.81A.75.75 0 0 1 8 .25Zm0 2.445L6.717 5.294a.75.75 0 0 1-.565.41l-2.868.417 2.075 2.023a.75.75 0 0 1 .216.664l-.49 2.857 2.565-1.348a.75.75 0 0 1 .698 0l2.565 1.348-.49-2.857a.75.75 0 0 1 .216-.664l2.075-2.023-2.868-.417a.75.75 0 0 1-.565-.41Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              {project.stars}
            </span>
          ) : null}
        </div>
        <div className="project-card__meta project-card__meta--secondary">
          <span className="project-card__meta-item">Updated {project.year}</span>
        </div>
      </div>
    </a>
  );
}

export default App;
