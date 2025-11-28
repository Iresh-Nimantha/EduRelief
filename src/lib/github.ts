const GITHUB_API_BASE = "https://api.github.com";

const githubConfig = {
  token: process.env.GITHUB_TOKEN,
  username: process.env.GITHUB_USERNAME,
  repo: process.env.GITHUB_REPO,
  branch: process.env.GITHUB_BRANCH ?? "main",
};

function assertEnv(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(`Missing required environment variable ${key}`);
  }
  return value;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "general";
}

export function buildGitHubPath(grade: string, subject: string, fileName: string) {
  const safeFileName = fileName.replace(/\s+/g, "-");
  return `grade-${slugify(grade)}/subject-${slugify(subject)}/${Date.now()}-${safeFileName}`;
}

export function buildRawGitHubUrl(path: string) {
  const username = assertEnv(githubConfig.username, "GITHUB_USERNAME");
  const repo = assertEnv(githubConfig.repo, "GITHUB_REPO");
  const branch = githubConfig.branch;
  return `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${path}`;
}

export async function commitFileToGitHub({
  path,
  content,
  message,
}: {
  path: string;
  content: string;
  message: string;
}) {
  const token = assertEnv(githubConfig.token, "GITHUB_TOKEN");
  const username = assertEnv(githubConfig.username, "GITHUB_USERNAME");
  const repo = assertEnv(githubConfig.repo, "GITHUB_REPO");

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${username}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content,
        branch: githubConfig.branch,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub upload failed: ${body}`);
  }

  return response.json();
}

