import { Octokit } from "@octokit/rest";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const owner = query.owner as string;
  const repo = query.repo as string;
  const username = query.username as string;
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
  const { data } = await octokit.request(
    "PUT /repos/{owner}/{repo}/collaborators/{username}",
    {
      owner,
      repo,
      username,
      permission: "read",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return data;
});
