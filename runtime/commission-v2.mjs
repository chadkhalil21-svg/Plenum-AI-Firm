import fs from "node:fs";
import { bindCase, createDispatchLedger, persistJson } from "./orchestrator.mjs";
import { executeWorker } from "./execute-worker-v2.mjs";
import { supervise } from "./supervisor.mjs";
import { evaluateWatchdog } from "./watchdog.mjs";

const evidenceView = records => records.map(r => ({
  agentId:r.agent_id, runId:r.run_id, disposition:r.disposition,
  candidateRevision:r.candidate_revision, output:r.output
}));

export async function commission(config){
  if(!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY required.");
  if(!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN required for client evidence.");

  const {projectId,caseId,repository,candidateRevision,mandate,requiredAgents}=config;
  if(candidateRevision.startsWith("REPLACE_")) throw new Error("Exact candidate revision required.");

  const bound=bindCase({projectId,caseId,repository,candidateRevision,mandate});
  const ledger=createDispatchLedger(bound,requiredAgents);
  const dir=`.plenum/cases/${bound.caseRunId}`;
  const workerRecords=[];
  persistJson(`${dir}/bound.json`,bound);
  persistJson(`${dir}/ledger.json`,ledger);

  for(const agentId of requiredAgents){
    const input=JSON.stringify({
      projectId,caseId,repository,candidateRevision,mandate,
      requirements:[
        "Inspect exact-revision repository evidence when repository facts matter.",
        "Use live research for current standards, comparative practice, design, language, hospitality, law, science, business, or other should-be propositions when available.",
        "Examine what exists, what is broken, what is missing, what is unnecessary, what should exist instead, and what may not yet have been considered where relevant.",
        "Separate observed defects from recommendations and NOT_TESTED properties."
      ]
    });
    try{
      const record=await executeWorker({agentId,projectId,caseId,candidateRevision,input});
      workerRecords.push(record);
      ledger.executions.push({agentId,runId:record.run_id,disposition:record.disposition});
    }catch(error){
      ledger.executions.push({agentId,disposition:"FAILED",error:String(error?.message||error)});
    }
    persistJson(`${dir}/ledger.json`,ledger);
  }

  const evidencePacket=evidenceView(workerRecords);
  persistJson(`${dir}/worker-evidence.json`,evidencePacket);

  const arbiter=await executeWorker({
    agentId:"evidence_arbiter",projectId,caseId,candidateRevision,
    input:JSON.stringify({bound,evidencePacket,instruction:"Adjudicate conflicts and normalize supported findings. Preserve disagreement and NOT_TESTED. Do not repair. Identify unsupported conclusions and evidence gaps."})
  });
  ledger.arbiterAdjudicated=arbiter.disposition==="COMPLETED";
  persistJson(`${dir}/arbiter.json`,arbiter);
  persistJson(`${dir}/ledger.json`,ledger);

  const primary=await executeWorker({
    agentId:"primary_orchestrator",projectId,caseId,candidateRevision,
    input:JSON.stringify({bound,evidencePacket,arbiterOutput:arbiter.output,instruction:"Synthesize the evidence into an actionable institutional finding set. Cover defects, omissions, unnecessary elements, should-be improvements, design, language, hospitality, standards and untested matters where applicable. Identify missing coverage. Do not self-certify."})
  });
  const proposal={candidateRevision,runId:primary.run_id,output:primary.output};
  persistJson(`${dir}/primary.json`,proposal);

  const supervisorModel=await executeWorker({
    agentId:"supervisory_orchestrator",projectId,caseId,candidateRevision,
    input:JSON.stringify({bound,evidencePacket,arbiterOutput:arbiter.output,proposal,instruction:"Independently reconstruct and challenge the investigation universe. Find omitted agents, evidence, denominators, perspectives, authorities, screens, states, journeys, controls, consequences, should-be questions and closure defects. Do not merely ratify the Primary."})
  });

  const mechanical=supervise({ledger,primaryProposal:proposal});
  const supervisor={...mechanical,modelRunId:supervisorModel.run_id,modelOutput:supervisorModel.output};
  ledger.supervisorReviewed=supervisorModel.disposition==="COMPLETED";
  persistJson(`${dir}/supervisor.json`,supervisor);
  persistJson(`${dir}/ledger.json`,ledger);

  const watchdog=evaluateWatchdog({ledger,supervisor,claims:[]});
  ledger.watchdogPassed=watchdog.pass;
  persistJson(`${dir}/watchdog.json`,watchdog);
  persistJson(`${dir}/ledger.json`,ledger);

  return {caseRunId:bound.caseRunId,candidateRevision,ledger,arbiterRunId:arbiter.run_id,primaryRunId:primary.run_id,supervisor,watchdog};
}

if(import.meta.url===`file://${process.argv[1]}`){
  const manifest=process.argv[2];
  if(!manifest) throw new Error("Usage: node runtime/commission-v2.mjs <manifest.json>");
  console.log(JSON.stringify(await commission(JSON.parse(fs.readFileSync(manifest,"utf8"))),null,2));
}
