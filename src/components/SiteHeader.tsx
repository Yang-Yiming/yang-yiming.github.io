import { sections, siteMeta } from "../content";
import type { SectionId } from "../types";

interface SiteHeaderProps {
  activeSection?: SectionId;
}

export function SiteHeader({ activeSection }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-mark" href="/">
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
                href={section.id === "home" ? "/" : `/#${section.id}`}
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
