import { tool } from "@openai/agents";
import { z } from "zod";

const apiVersion="2026-03-10";

function token(){
  const value=process.env.GITHUB_WRITE_TOKEN;
  if(!value) throw new Error("GITHUB_WRITE_TOKEN required for authorized client repair.");
  return value;
}
function parseRepository(repository){
  const [owner,repo]=repository.split("/");
  if(!owner||!repo) throw new Error("repository must be owner/name");
  return {owner,repo};
}
async function github(path,init={}){
  const response=await fetch(`https://api.github.com${path}`,{
    ...init,
    headers:{
      Accept:"application/vnd.github+json",
      Authorization:`Bearer ${token()}`,
      "X-GitHub-Api-Version":apiVersion,
      "User-Agent":"Plenum-AI-Firm",
      ...(init.headers||{})
    }
  });
  if(!response.ok) throw new Error(`GitHub ${response.status}: ${await response.text()}`);
  if(response.status===204) return {};
  return response.json();
}

export const githubCreateRepairBranch=tool({
  name:"github_create_repair_branch",
  description:"Create a dedicated Plenum repair branch from an exact authorized base revision. Never writes the default branch.",
  parameters:z.object({repository:z.string(),baseRevision:z.string(),branch:z.string().regex(/^plenum\/repair\/[A-Za-z0-9._-]+$/)}),
  execute:async({repository,baseRevision,branch})=>{
    const {owner,repo}=parseRepository(repository);
    const commit=await github(`/repos/${owner}/${repo}/commits/${encodeURIComponent(baseRevision)}`);
    if(commit.sha!==baseRevision) throw new Error("Base revision did not resolve exactly.");
    const created=await github(`/repos/${owner}/${repo}/git/refs`,{method:"POST",body:JSON.stringify({ref:`refs/heads/${branch}`,sha:baseRevision})});
    return JSON.stringify({repository,branch,base_revision:baseRevision,ref:created.ref});
  }
});

export const githubWriteRepairFile=tool({
  name:"github_write_repair_file",
  description:"Create or replace one UTF-8 file on an existing plenum/repair/* branch. Requires the caller to provide the current blob SHA when replacing a file.",
  parameters:z.object({repository:z.string(),branch:z.string().regex(/^plenum\/repair\/[A-Za-z0-9._-]+$/),path:z.string(),content:z.string(),message:z.string(),currentBlobSha:z.string().optional()}),
  execute:async({repository,branch,path,content,message,currentBlobSha})=>{
    const {owner,repo}=parseRepository(repository);
    const body={message,content:Buffer.from(content,"utf8").toString("base64"),branch};
    if(currentBlobSha) body.sha=currentBlobSha;
    const data=await github(`/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,{method:"PUT",body:JSON.stringify(body)});
    return JSON.stringify({repository,branch,path,commit_sha:data.commit?.sha,content_sha:data.content?.sha});
  }
});

export const githubOpenRepairPullRequest=tool({
  name:"github_open_repair_pull_request",
  description:"Open a pull request for a Plenum repair branch. This does not merge or deploy it.",
  parameters:z.object({repository:z.string(),branch:z.string().regex(/^plenum\/repair\/[A-Za-z0-9._-]+$/),base:z.string(),title:z.string(),body:z.string()}),
  execute:async({repository,branch,base,title,body})=>{
    const {owner,repo}=parseRepository(repository);
    const data=await github(`/repos/${owner}/${repo}/pulls`,{method:"POST",body:JSON.stringify({title,head:branch,base,body})});
    return JSON.stringify({number:data.number,url:data.html_url,head_sha:data.head?.sha,base_sha:data.base?.sha});
  }
});

export const githubRepairTools=[githubCreateRepairBranch,githubWriteRepairFile,githubOpenRepairPullRequest];
