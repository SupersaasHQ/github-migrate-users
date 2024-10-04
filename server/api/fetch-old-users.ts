import { Octokit } from "@octokit/rest";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const owner = query.owner as string;
  const repo = query.repo as string;

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  let allCollaborators: any[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await octokit.request(
      `GET /repos/${owner}/${repo}/collaborators`,
      {
        per_page: 100,
        page: page,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    const collaborators = response.data.map(
      (collaborator: { login: string; id: number; avatar_url: string }) => ({
        login: collaborator.login,
        id: collaborator.id,
        avatar_url: collaborator.avatar_url,
      })
    );

    allCollaborators = [...allCollaborators, ...collaborators];

    const linkHeader = response.headers.link;
    hasNextPage = Boolean(linkHeader && linkHeader.includes('rel="next"'));
    page++;
  }

  return allCollaborators;
});
