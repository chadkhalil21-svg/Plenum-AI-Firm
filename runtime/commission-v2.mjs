import fs from "node:fs";
import { bindCase, createDispatchLedger, persistJson } from "./orchestrator.mjs";
import { executeWorker } from "./execute-worker-v2.mjs";
import { supervise } from "./supervisor.mjs";
import { evaluateWatchdog } from "./watchdog.mjs";

export async function commission(config){
  if(!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY required.");
  if(!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN required for client evidence.");

  const {projectId,caseId,repository,candidateRevision,mandate,requiredAgents}=config;
  if(candidateRevision.startsWith("REPLACE_")) throw new Error("Exact candidate revision required.");

  const bound=bindCase({projectId,caseId,repository,candidateRevision,mandate});
  const ledger=createDispatchLedger(bound,requiredAgents);
  const dir=`.plenum/cases/${bound.caseRunId}`;
  persistJson(`${dir}/bound.json`,bound);
  persistJson(`${dir}/ledger.json`,ledger);

  for(const agentId of requiredAgents){
    const input=JSON.stringify({
      projectId,caseId,repository,candidateRevision,mandate,
      requirements:[
        "Use GitHub tools to inspect exact-revision evidence when your mandate depends on repository facts.",
        "Use live web search when your mandate depends on current external guidance or comparative practice and the tool is available.",
        "Investigate omissions and should-be questions where relevant.",
        "State NOT_TESTED for properties you cannot actually establish."
      ]
    });
    try{
      const record=await executeWorker({agentId,projectId,caseId,candidateRevision,input});
      ledger.executions.push({agentId,runId:record.run_id,disposition:record.disposition});
    }catch(error){
      ledger.executions.push({agentId,disposition:"FAILED",error:String(error?.message||error)});
    }
    persistJson(`${dir}/ledger.json`,ledger);
  }

  const primary=await executeWorker({
    agentId:"primary_orchestrator",projectId,caseId,candidateRevision,
    input:JSON.stringify({bound,ledger,instruction:"Synthesize only supported findings. Identify missing coverage. Do not certify."})
  });
  const proposal={candidateRevision,runId:primary.run_id,output:primary.output};
  persistJson(`${dir}/primary.json`,proposal);

  const supervisorModel=await executeWorker({
    agentId:"supervisory_orchestrator",projectId,caseId,candidateRevision,
    input:JSON.stringify({bound,ledger,proposal,instruction:"Independently challenge scope, denominators, omitted agents, evidence, should-be analysis, comparative research, and closure. Find what the Primary missed."})
  });

  const mechanical=supervise({ledger,primaryProposal:proposal});
  const supervisor={...mechanical,modelRunId:supervisorModel.run_id,modelOutput:supervisorModel.output};
  persistJson(`${dir}/supervisor.json`,supervisor);

  const watchdog=evaluateWatchdog({ledger,supervisor,claims:[]});
  persistJson(`${dir}/watchdog.json`,watchdog);

  return {caseRunId:bound.caseRunId,candidateRevision,ledger,primaryRunId:primary.run_id,supervisor,watchdog};
}

if(import.meta.url===`file://${process.argv[1]}`){
  const manifest=process.argv[2];
  if(!manifest) throw new Error("Usage: node runtime/commission-v2.mjs <manifest.json>");
  console.log(JSON.stringify(await commission(JSON.parse(fs.readFileSync(manifest,"utf8"))),null,2));
}
