import { useEffect, useMemo, useState } from "react";
import { EditorialSection } from "./components/EditorialSection";
import { Hero } from "./components/Hero";
import { ProjectsSection } from "./components/ProjectsSection";
import { SiteHeader } from "./components/SiteHeader";
import { sections } from "./content";
import type { SectionId } from "./types";

const observerOffset = "-35% 0px -45% 0px";

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

export default App;
