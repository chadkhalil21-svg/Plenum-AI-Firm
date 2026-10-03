import { tool } from "@openai/agents";
import { z } from "zod";

const apiVersion = "2026-03-10";

function token() {
  const value = process.env.GITHUB_TOKEN;
  if (!value) throw new Error("GITHUB_TOKEN is required for private/client repository inspection.");
  return value;
}

function headers() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token()}`,
    "X-GitHub-Api-Version": apiVersion,
    "User-Agent": "Plenum-AI-Firm"
  };
}

function parseRepository(repository) {
  const [owner, repo] = repository.split("/");
  if (!owner || !repo) throw new Error("repository must be owner/name");
  return {owner,repo};
}

async function github(path, init={}) {
  const response = await fetch(`https://api.github.com${path}`, {...init,headers:{...headers(),...(init.headers||{})}});
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${await response.text()}`);
  return response.json();
}

export const githubCommit = tool({
  name:"github_get_commit",
  description:"Read commit metadata for an exact GitHub repository revision.",
  parameters:z.object({repository:z.string(),ref:z.string()}),
  execute:async({repository,ref})=>{
    const {owner,repo}=parseRepository(repository);
    const data=await github(`/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}`);
    return JSON.stringify({sha:data.sha,commit:data.commit,html_url:data.html_url});
  }
});

export const githubTree = tool({
  name:"github_get_tree",
  description:"Inventory the Git tree at an exact commit/ref. Returns paths, types, SHAs and sizes.",
  parameters:z.object({repository:z.string(),ref:z.string()}),
  execute:async({repository,ref})=>{
    const {owner,repo}=parseRepository(repository);
    const commit=await github(`/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}`);
    const tree=await github(`/repos/${owner}/${repo}/git/trees/${commit.commit.tree.sha}?recursive=1`);
    if(tree.truncated) throw new Error("GitHub recursive tree truncated; exhaustive inventory cannot be claimed.");
    return JSON.stringify({candidate_revision:commit.sha,tree_sha:tree.sha,truncated:tree.truncated,tree:tree.tree});
  }
});

export const githubFile = tool({
  name:"github_read_file",
  description:"Read a UTF-8 repository file at an exact commit/ref. Use this to inspect current implementation, tests, policies, and configuration.",
  parameters:z.object({repository:z.string(),path:z.string(),ref:z.string()}),
  execute:async({repository,path,ref})=>{
    const {owner,repo}=parseRepository(repository);
    const response=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`,{
      headers:{...headers(),Accept:"application/vnd.github.raw+json"}
    });
    if(!response.ok) throw new Error(`GitHub ${response.status}: ${await response.text()}`);
    const content=await response.text();
    return JSON.stringify({repository,path,ref,content});
  }
});

export const githubTools=[githubCommit,githubTree,githubFile];
