import { useEffect, useMemo, useRef, useState } from "react";
import { EntryPage } from "./components/EntryPage";
import { EditorialSection } from "./components/EditorialSection";
import { Hero } from "./components/Hero";
import { NotFoundPage } from "./components/NotFoundPage";
import { ProjectsSection } from "./components/ProjectsSection";
import { SiteHeader } from "./components/SiteHeader";
import { getEntry, sections } from "./content";
import type { EntryCollectionId, SectionId } from "./types";

const anchorOffset = 18;

type AppRoute =
  | { kind: "home"; hash: string }
  | {
      kind: "entry";
      collectionId: EntryCollectionId;
      slug: string;
    }
  | { kind: "notFound" };

type ScrollTarget =
  | { kind: "preserve"; top: number }
  | { kind: "section"; sectionId: SectionId }
  | { kind: "top" }
  | null;

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

function scrollToSectionHeading(
  sectionId: SectionId,
  behavior: ScrollBehavior = "smooth",
) {
  const heading = document.querySelector<HTMLElement>(
    `[data-section-anchor="${sectionId}"]`,
  );

  if (!heading) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior,
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
    behavior,
  });
}

function getCurrentRoute(): AppRoute {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const entryMatch = pathname.match(/^\/(life|blog)\/([^/]+)$/);

  if (entryMatch) {
    return {
      kind: "entry",
      collectionId: entryMatch[1] as EntryCollectionId,
      slug: decodeURIComponent(entryMatch[2]),
    };
  }

  if (pathname === "/") {
    return {
      kind: "home",
      hash: window.location.hash,
    };
  }

  return { kind: "notFound" };
}

function getLocationKey(url: URL | Location) {
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  return `${pathname}${url.hash}`;
}

function getScrollTarget(
  nextRoute: AppRoute,
  url: URL | Location,
  sectionIds: SectionId[],
  scrollPositions: Record<string, number>,
): ScrollTarget {
  const savedTop = scrollPositions[getLocationKey(url)];

  if (savedTop !== undefined) {
    return {
      kind: "preserve",
      top: savedTop,
    };
  }

  if (nextRoute.kind === "entry" || nextRoute.kind === "notFound") {
    return { kind: "top" };
  }

  if (!nextRoute.hash) {
    return null;
  }

  const sectionId = nextRoute.hash.slice(1) as SectionId;

  if (!sectionIds.includes(sectionId)) {
    return null;
  }

  return {
    kind: "section",
    sectionId,
  };
}

function App() {
  const sectionIds = useMemo(() => sections.map((section) => section.id), []);
  const [route, setRoute] = useState<AppRoute>(() => getCurrentRoute());
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const currentLocationKeyRef = useRef(getLocationKey(window.location));
  const pendingScrollRef = useRef<ScrollTarget>(
    getScrollTarget(getCurrentRoute(), window.location, sectionIds, {}),
  );

  useEffect(() => {
    const syncRoute = () => {
      scrollPositionsRef.current[currentLocationKeyRef.current] = window.scrollY;
      const nextRoute = getCurrentRoute();
      pendingScrollRef.current = getScrollTarget(
        nextRoute,
        window.location,
        sectionIds,
        scrollPositionsRef.current,
      );
      currentLocationKeyRef.current = getLocationKey(window.location);
      setRoute(nextRoute);
    };

    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);

    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, [sectionIds]);

  useEffect(() => {
    if (route.kind !== "home") {
      return;
    }

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
      scrollPositionsRef.current[currentLocationKeyRef.current] = window.scrollY;
      scrollToSectionHeading(sectionId);
      window.history.pushState(null, "", hash);
      currentLocationKeyRef.current = getLocationKey(window.location);
      scrollPositionsRef.current[currentLocationKeyRef.current] = window.scrollY;
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
  }, [route.kind, sectionIds]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");

      if (!anchor || anchor.target || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);

      if (url.origin !== window.location.origin) {
        return;
      }

      const nextRoute = getCurrentRouteFromUrl(url);

      if (nextRoute === null) {
        return;
      }

      event.preventDefault();
      scrollPositionsRef.current[currentLocationKeyRef.current] = window.scrollY;
      pendingScrollRef.current = getScrollTarget(
        nextRoute,
        url,
        sectionIds,
        scrollPositionsRef.current,
      );
      window.history.pushState(null, "", `${url.pathname}${url.hash}`);
      currentLocationKeyRef.current = getLocationKey(url);
      setRoute(nextRoute);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [sectionIds]);

  useEffect(() => {
    const pendingScroll = pendingScrollRef.current;

    if (!pendingScroll) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (pendingScroll.kind === "preserve") {
        window.scrollTo({
          top: pendingScroll.top,
        });
      }

      if (pendingScroll.kind === "top") {
        window.scrollTo({
          top: 0,
        });
      }

      if (pendingScroll.kind === "section") {
        scrollToSectionHeading(pendingScroll.sectionId, "auto");
      }
    });

    pendingScrollRef.current = null;
  }, [route, sectionIds]);

  if (route.kind === "entry") {
    const entry = getEntry(route.collectionId, route.slug);

    if (!entry) {
      return (
        <div className="page-shell">
          <SiteHeader activeSection={route.collectionId} />
          <NotFoundPage />
        </div>
      );
    }

    return (
      <div className="page-shell">
        <SiteHeader activeSection={entry.collectionId} />
        <EntryPage entry={entry} />
      </div>
    );
  }

  if (route.kind === "notFound") {
    return (
      <div className="page-shell">
        <SiteHeader />
        <NotFoundPage />
      </div>
    );
  }

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

function getCurrentRouteFromUrl(url: URL) {
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const entryMatch = pathname.match(/^\/(life|blog)\/([^/]+)$/);

  if (entryMatch) {
    return {
      kind: "entry",
      collectionId: entryMatch[1] as EntryCollectionId,
      slug: decodeURIComponent(entryMatch[2]),
    } satisfies AppRoute;
  }

  if (pathname === "/") {
    return {
      kind: "home",
      hash: url.hash,
    } satisfies AppRoute;
  }

  return null;
}

export default App;
