import { useEffect, useState } from "react";
import { sections, siteMeta } from "../content";
import type { SectionId } from "../types";

type ThemeMode = "auto" | "light" | "dark";

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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "auto";
    }

    const storedMode = window.localStorage.getItem("theme-mode") as ThemeMode | null;
    return storedMode ?? "auto";
  });
  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === "auto") {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return systemDark ? "light" : "dark";
      }
      return prev === "light" ? "dark" : "light";
    });
  };

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

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (themeMode === "auto") {
      document.documentElement.removeAttribute("data-theme");
      return;
    }

    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("theme-mode", themeMode);
  }, [themeMode]);

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
        <div className="site-header__controls">
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

          <div className="theme-toggle">
            <button
              type="button"
              className="theme-toggle__button"
              onClick={toggleTheme}
              aria-label={`Switch theme${themeMode !== "auto" ? ` (currently ${themeMode})` : ""}`}
            >
              <span className="theme-toggle__icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
