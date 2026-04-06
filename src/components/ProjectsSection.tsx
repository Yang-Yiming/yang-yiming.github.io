import { renderMarkdown } from "../lib/markdown";
import type { SectionContent } from "../types";
import { ProjectCard } from "./ProjectCard";

interface ProjectsSectionProps {
  section: SectionContent;
}

export function ProjectsSection({ section }: ProjectsSectionProps) {
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
