import { useEffect, useMemo, useState } from "react";
import { EditorialSection } from "./components/EditorialSection";
import { Hero } from "./components/Hero";
import { ProjectsSection } from "./components/ProjectsSection";
import { SiteHeader } from "./components/SiteHeader";
import { sections } from "./content";
import type { SectionId } from "./types";

const anchorOffset = 18;

interface SectionMetrics {
  id: SectionId;
  visibleRatio: number;
  centerOffset: number;
}

function getVisibleRatio(rect: DOMRect, viewportHeight: number) {
  const visibleHeight =
    Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);

  if (visibleHeight <= 0) {
    return 0;
  }

  return visibleHeight / Math.min(rect.height, viewportHeight);
}

function collectSectionMetrics(sectionIds: SectionId[]) {
  const viewportHeight = window.innerHeight;
  const viewportCenter = viewportHeight / 2;

  return sectionIds
    .map((id) => {
      const element = document.getElementById(id);

      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();

      return {
        id,
        visibleRatio: getVisibleRatio(rect, viewportHeight),
        centerOffset: rect.top + rect.height / 2 - viewportCenter,
      } satisfies SectionMetrics;
    })
    .filter((metric): metric is SectionMetrics => metric !== null);
}

function getDominantSection(metrics: SectionMetrics[]) {
  return [...metrics].sort((left, right) => {
    const distanceDelta =
      Math.abs(left.centerOffset) - Math.abs(right.centerOffset);

    if (distanceDelta !== 0) {
      return distanceDelta;
    }

    return right.visibleRatio - left.visibleRatio;
  })[0];
}

function scrollToSectionHeading(sectionId: SectionId) {
  const heading = document.querySelector<HTMLElement>(
    `[data-section-anchor="${sectionId}"]`,
  );

  if (!heading) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }

  const headerHeight =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
    ) || 0;
  const top =
    window.scrollY + heading.getBoundingClientRect().top - headerHeight - anchorOffset;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth",
  });
}

function App() {
  const sectionIds = useMemo(() => sections.map((section) => section.id), []);
  const [activeSection, setActiveSection] = useState<SectionId>("home");

  useEffect(() => {
    let frameId = 0;

    const updateActiveSection = () => {
      frameId = 0;

      const metrics = collectSectionMetrics(sectionIds);
      const dominantSection = getDominantSection(metrics);

      if (dominantSection) {
        setActiveSection(dominantSection.id);
      }
    };

    const requestActiveSectionUpdate = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    const handleScroll = () => {
      requestActiveSectionUpdate();
    };

    requestActiveSectionUpdate();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", requestActiveSectionUpdate);

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');

      if (!anchor) {
        return;
      }

      const hash = anchor.getAttribute("href");

      if (!hash || hash === "#") {
        return;
      }

      const sectionId = hash.slice(1) as SectionId;

      if (!sectionIds.includes(sectionId)) {
        return;
      }

      event.preventDefault();
      scrollToSectionHeading(sectionId);
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", requestActiveSectionUpdate);
      document.removeEventListener("click", handleAnchorClick);
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

export default App;
