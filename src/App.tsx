import { useEffect, useMemo, useRef, useState } from "react";
import { EditorialSection } from "./components/EditorialSection";
import { Hero } from "./components/Hero";
import { ProjectsSection } from "./components/ProjectsSection";
import { SiteHeader } from "./components/SiteHeader";
import { sections } from "./content";
import type { SectionId } from "./types";

const desktopSnapQuery = "(min-width: 901px) and (hover: hover) and (pointer: fine)";
const previousSectionRemainderThreshold = 0.2;
const snapDominanceThreshold = 0.52;
const scrollStopDelay = 140;
const snapAlignmentTolerance = 24;

interface SectionMetrics {
  id: SectionId;
  element: HTMLElement;
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
        element,
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

function App() {
  const sectionIds = useMemo(() => sections.map((section) => section.id), []);
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const scrollStopTimeoutRef = useRef<number | null>(null);
  const snapTargetRef = useRef<SectionId | null>(null);

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

    const snapToDominantSection = () => {
      const mediaQuery = window.matchMedia(desktopSnapQuery);

      if (!mediaQuery.matches) {
        snapTargetRef.current = null;
        return;
      }

      const metrics = collectSectionMetrics(sectionIds);
      const dominantSection = getDominantSection(metrics);

      if (!dominantSection) {
        return;
      }

      const dominantIndex = metrics.findIndex(
        (metric) => metric.id === dominantSection.id,
      );
      const previousSection = dominantIndex > 0 ? metrics[dominantIndex - 1] : null;
      const shouldSnap =
        dominantSection.visibleRatio >= snapDominanceThreshold ||
        (previousSection?.visibleRatio ?? 0) <= previousSectionRemainderThreshold;
      const headerOffset =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
        ) || 0;
      const topOffset = dominantSection.element.getBoundingClientRect().top - headerOffset;

      if (
        !shouldSnap ||
        Math.abs(topOffset) <= snapAlignmentTolerance ||
        snapTargetRef.current === dominantSection.id
      ) {
        if (Math.abs(topOffset) <= snapAlignmentTolerance) {
          snapTargetRef.current = null;
        }

        return;
      }

      snapTargetRef.current = dominantSection.id;
      dominantSection.element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.setTimeout(() => {
        if (snapTargetRef.current === dominantSection.id) {
          snapTargetRef.current = null;
        }
      }, 420);
    };

    const handleScroll = () => {
      requestActiveSectionUpdate();

      if (scrollStopTimeoutRef.current !== null) {
        window.clearTimeout(scrollStopTimeoutRef.current);
      }

      scrollStopTimeoutRef.current = window.setTimeout(() => {
        scrollStopTimeoutRef.current = null;
        snapToDominantSection();
      }, scrollStopDelay);
    };

    requestActiveSectionUpdate();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", requestActiveSectionUpdate);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      if (scrollStopTimeoutRef.current !== null) {
        window.clearTimeout(scrollStopTimeoutRef.current);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", requestActiveSectionUpdate);
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
