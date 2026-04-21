import { getRepoLabel } from "../lib/github";
import { renderMarkdown } from "../lib/markdown";
import type { GitHubProject } from "../types";

const languageColors: Record<string, string> = {
  Swift: "#ffac45",
  Rust: "#dea584",
  JavaScript: "#f1e05a",
  Javascript: "#f1e05a",
  Python: "#3572A5",
  TypeScript: "#3178c6",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Shell: "#89e051",
};

interface ProjectCardProps {
  project: GitHubProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
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
              <span
                className="project-card__language-dot"
                aria-hidden="true"
                style={{ background: languageColors[project.language] || "var(--accent)" }}
              />
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
