export interface RepoStats {
  stars: number;
  language?: string;
  pushedAt: Date;
}

export const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Rust: "#dea584",
  Swift: "#ffac45",
  TypeScript: "#3178c6",
};

const cache = new Map<string, Promise<RepoStats | undefined>>();

// Cached per build so every card only hits the API once.
export function getRepoStats(repo: string) {
  let stats = cache.get(repo);
  if (!stats) {
    stats = fetchRepoStats(repo);
    cache.set(repo, stats);
  }
  return stats;
}

async function fetchRepoStats(repo: string): Promise<RepoStats | undefined> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return {
      stars: data.stargazers_count,
      language: data.language ?? undefined,
      pushedAt: new Date(data.pushed_at),
    };
  } catch (error) {
    console.warn(`[github] Skipping live stats for ${repo}: ${error}`);
    return undefined;
  }
}
