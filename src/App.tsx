import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { EditorialSection } from "./components/EditorialSection";
import { Hero } from "./components/Hero";
import { Landing } from "./components/Landing";
import { NotFoundPage } from "./components/NotFoundPage";
import { ProjectsSection } from "./components/ProjectsSection";
import { SiteHeader } from "./components/SiteHeader";
import { interpolateWavePath } from "./components/Wave";
import { getEntry, sections } from "./content";
import type { EntryCollectionId, SectionId } from "./types";

const anchorOffset = 18;
const EntryPage = lazy(() =>
  import("./components/EntryPage").then((module) => ({
    default: module.EntryPage,
  })),
);

type HomeRoute = { kind: "home"; hash: string };
type EntryRoute = {
  kind: "entry";
  collectionId: EntryCollectionId;
  hash: string;
  slug: string;
};
type NotFoundRoute = { kind: "notFound" };
type AppRoute = HomeRoute | EntryRoute | NotFoundRoute;

type ScrollTarget =
  | { kind: "preserve"; top: number }
  | { kind: "fragment"; id: string }
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

function scrollToFragment(id: string, behavior: ScrollBehavior = "smooth") {
  const target = document.getElementById(id);

  if (!target) {
    return;
  }

  target.scrollIntoView({
    behavior,
    block: "start",
  });
}

function parseRoute(url: URL | Location): AppRoute {
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const entryMatch = pathname.match(/^\/(life|blog)\/([^/]+)$/);

  if (entryMatch) {
    return {
      kind: "entry",
      collectionId: entryMatch[1] as EntryCollectionId,
      hash: url.hash,
      slug: decodeURIComponent(entryMatch[2]),
    };
  }

  if (pathname === "/") {
    return {
      kind: "home",
      hash: url.hash,
    };
  }

  return { kind: "notFound" };
}

function getLocationKey(url: URL | Location) {
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  return `${pathname}${url.hash}`;
}

function getHashSectionId(hash: string, sectionIds: SectionId[]) {
  const sectionId = hash.slice(1) as SectionId;
  return sectionIds.includes(sectionId) ? sectionId : null;
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

  if (nextRoute.kind === "entry") {
    if (nextRoute.hash) {
      return {
        kind: "fragment",
        id: decodeURIComponent(nextRoute.hash.slice(1)),
      };
    }

    return { kind: "top" };
  }

  if (nextRoute.kind === "notFound") {
    return { kind: "top" };
  }

  if (!nextRoute.hash) {
    return { kind: "top" };
  }

  const sectionId = getHashSectionId(nextRoute.hash, sectionIds);

  if (!sectionId) {
    return null;
  }

  return {
    kind: "section",
    sectionId,
  };
}

interface HomeContentProps {}

function HomeContent(_props: HomeContentProps) {
  return (
    <main className="page-main">
      <Hero />
      {sections
        .filter((section) => section.id !== "home")
        .map((section) => (
          section.id === "projects" ? (
            <ProjectsSection key={section.id} section={section} />
          ) : (
            <EditorialSection
              key={section.id}
              section={section}
            />
          )
        ))}
    </main>
  );
}

function EntryPageLoader() {
  return (
    <main className="page-main">
      <article className="entry-page entry-page--loading" aria-busy="true">
        <p className="section-kicker">Loading</p>
      </article>
    </main>
  );
}

function App() {
  const sectionIds = useMemo(() => sections.map((section) => section.id), []);
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location));
  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    if (window.location.pathname !== "/") {
      return "home";
    }

    return getHashSectionId(window.location.hash, sectionIds) ?? "home";
  });
  const [backgroundHomeRoute, setBackgroundHomeRoute] = useState<HomeRoute | null>(
    route.kind === "home" ? route : null,
  );

  const currentLocationKeyRef = useRef(getLocationKey(window.location));
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const pendingScrollRef = useRef<ScrollTarget>(null);
  const isEntryOverlay = route.kind === "entry" && backgroundHomeRoute !== null;

  const snapLockRef = useRef(false);
  const animationFrameRef = useRef(0);
  const wavePathRef = useRef<SVGPathElement | null>(null);

  const performSnap = (target: 0 | 1) => {
    if (snapLockRef.current) return;
    snapLockRef.current = true;
    cancelAnimationFrame(animationFrameRef.current);

    const vh = window.innerHeight;
    const duration = 1000;
    const start = performance.now();
    const fromScroll = window.scrollY;
    const toScroll = target * vh;

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = -(Math.cos(Math.PI * t) - 1) / 2;
      const sy = fromScroll + (toScroll - fromScroll) * eased;

      document.documentElement.scrollTop = sy;

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      snapLockRef.current = false;
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) {
      return;
    }

    const previousValue = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousValue;
    };
  }, []);

  useEffect(() => {
    if (route.kind === "home") {
      setBackgroundHomeRoute(route);
    }
  }, [route]);

  useEffect(() => {
    if (route.kind !== "home") {
      document.documentElement.style.removeProperty("--landing-progress");
      return;
    }

    const updateLandingProgress = () => {
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / window.innerHeight),
      );

      document.documentElement.style.setProperty(
        "--landing-progress",
        String(progress),
      );

      if (wavePathRef.current) {
        wavePathRef.current.setAttribute("d", interpolateWavePath(progress));
      }
    };

    updateLandingProgress();
    window.addEventListener("scroll", updateLandingProgress, { passive: true });
    window.addEventListener("resize", updateLandingProgress);

    return () => {
      window.removeEventListener("scroll", updateLandingProgress);
      window.removeEventListener("resize", updateLandingProgress);
      document.documentElement.style.removeProperty("--landing-progress");
    };
  }, [route.kind]);

  useEffect(() => {
    if (route.kind !== "home") return;

    const handleWheel = (e: WheelEvent) => {
      if (snapLockRef.current) {
        e.preventDefault();
        return;
      }

      const sy = window.scrollY;
      const vh = window.innerHeight;

      if (sy < 20 && e.deltaY > 0) {
        e.preventDefault();
        performSnap(1);
        return;
      }

      if (sy <= vh + 40 && sy > 20 && e.deltaY < 0) {
        e.preventDefault();
        performSnap(0);
        return;
      }
    };

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (snapLockRef.current || e.touches.length !== 1) return;

      const deltaY = touchStartY - e.touches[0].clientY;
      const sy = window.scrollY;
      const vh = window.innerHeight;

      if (sy < 20 && deltaY > 10) {
        performSnap(1);
        return;
      }

      if (sy <= vh + 40 && sy > 20 && deltaY < -10) {
        performSnap(0);
        return;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [route.kind]);

  useEffect(() => {
    if (!isEntryOverlay) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isEntryOverlay]);

  useEffect(() => {
    const syncFromLocation = () => {
      scrollPositionsRef.current[currentLocationKeyRef.current] = window.scrollY;

      const nextRoute = parseRoute(window.location);
      const nextKey = getLocationKey(window.location);
      pendingScrollRef.current = getScrollTarget(
        nextRoute,
        window.location,
        sectionIds,
        scrollPositionsRef.current,
      );
      currentLocationKeyRef.current = nextKey;

      if (nextRoute.kind === "home") {
        const sectionId = getHashSectionId(nextRoute.hash, sectionIds);
        setActiveSection(sectionId ?? "home");
      }

      setRoute(nextRoute);
    };

    window.addEventListener("popstate", syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, [sectionIds]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

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

      const nextRoute = parseRoute(url);
      const nextKey = getLocationKey(url);

      if (nextRoute.kind === "notFound") {
        return;
      }

      event.preventDefault();
      scrollPositionsRef.current[currentLocationKeyRef.current] = window.scrollY;

      if (
        route.kind === "entry" &&
        nextRoute.kind === "entry" &&
        route.collectionId === nextRoute.collectionId &&
        route.slug === nextRoute.slug
      ) {
        window.history.pushState(null, "", `${url.pathname}${url.hash}`);
        currentLocationKeyRef.current = nextKey;
        setRoute(nextRoute);

        if (nextRoute.hash) {
          scrollToFragment(decodeURIComponent(nextRoute.hash.slice(1)), "smooth");
        } else {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }

        return;
      }

      if (nextRoute.kind === "home" && url.pathname === "/") {
        const sectionId = getHashSectionId(nextRoute.hash, sectionIds);

        if (route.kind === "home") {
          window.history.pushState(null, "", `${url.pathname}${url.hash}`);
          currentLocationKeyRef.current = nextKey;
          setRoute(nextRoute);
          setActiveSection(sectionId ?? "home");

          if (sectionId) {
            scrollToSectionHeading(sectionId, "smooth");
          } else {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }

          return;
        }

        pendingScrollRef.current = getScrollTarget(
          nextRoute,
          url,
          sectionIds,
          scrollPositionsRef.current,
        );
        window.history.pushState(null, "", `${url.pathname}${url.hash}`);
        currentLocationKeyRef.current = nextKey;
        setActiveSection(sectionId ?? "home");
        setRoute(nextRoute);
        return;
      }

      pendingScrollRef.current =
        route.kind === "home" && nextRoute.kind === "entry"
          ? null
          : getScrollTarget(nextRoute, url, sectionIds, scrollPositionsRef.current);
      window.history.pushState(null, "", `${url.pathname}${url.hash}`);
      currentLocationKeyRef.current = nextKey;
      setRoute(nextRoute);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [route, sectionIds]);

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

    requestActiveSectionUpdate();
    window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
    window.addEventListener("resize", requestActiveSectionUpdate);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestActiveSectionUpdate);
      window.removeEventListener("resize", requestActiveSectionUpdate);
    };
  }, [route.kind, sectionIds]);

  useEffect(() => {
    if (isEntryOverlay) {
      pendingScrollRef.current = null;
      return;
    }

    const pendingScroll = pendingScrollRef.current;

    if (!pendingScroll) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (pendingScroll.kind === "preserve") {
        window.scrollTo({
          top: pendingScroll.top,
          behavior: "auto",
        });
      }

      if (pendingScroll.kind === "top") {
        window.scrollTo({
          top: 0,
          behavior: "auto",
        });
      }

      if (pendingScroll.kind === "fragment") {
        scrollToFragment(pendingScroll.id, "auto");
      }

      if (pendingScroll.kind === "section") {
        scrollToSectionHeading(pendingScroll.sectionId, "auto");
      }
    });

    pendingScrollRef.current = null;
  }, [isEntryOverlay, route]);

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

    if (isEntryOverlay) {
      return (
        <div className="page-shell">
          <SiteHeader activeSection={entry.collectionId} />
          <HomeContent />
          <div className="entry-overlay" role="dialog" aria-modal="true">
            <div className="entry-overlay__panel">
              <Suspense fallback={<EntryPageLoader />}>
                <EntryPage entry={entry} />
              </Suspense>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="page-shell">
        <SiteHeader activeSection={entry.collectionId} />
        <Suspense fallback={<EntryPageLoader />}>
          <EntryPage entry={entry} />
        </Suspense>
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
    <div className="page-shell page-shell--has-landing">
      <SiteHeader activeSection={activeSection} isHome />
      <Landing onEnter={() => performSnap(1)} pathRef={wavePathRef} />
      <HomeContent />
    </div>
  );
}

export default App;
