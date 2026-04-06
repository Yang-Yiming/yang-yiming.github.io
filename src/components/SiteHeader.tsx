import { useEffect, useState } from "react";
import { sections, siteMeta } from "../content";
import type { SectionId } from "../types";

interface SiteHeaderProps {
  activeSection?: SectionId;
  isHome?: boolean;
}

const expandedScrollThreshold = 56;

export function SiteHeader({ activeSection, isHome = false }: SiteHeaderProps) {
  const [isCompact, setIsCompact] = useState(() => {
    if (!isHome) {
      return true;
    }

    return window.scrollY > expandedScrollThreshold;
  });

  useEffect(() => {
    if (!isHome) {
      setIsCompact(true);
      return;
    }

    const updateHeaderState = () => {
      setIsCompact(window.scrollY > expandedScrollThreshold);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
    };
  }, [isHome]);

  useEffect(() => {
    const navHeight = isHome && !isCompact
      ? "var(--nav-height-home-expanded)"
      : "var(--nav-height-compact)";

    document.documentElement.style.setProperty("--nav-height", navHeight);

    return () => {
      document.documentElement.style.setProperty(
        "--nav-height",
        "var(--nav-height-compact)",
      );
    };
  }, [isCompact, isHome]);

  const headerClassName = [
    "site-header",
    isHome ? "site-header--home" : "",
    isCompact ? "site-header--compact" : "site-header--expanded",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClassName}>
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
