import fs from "node:fs";
import { bindCase, createDispatchLedger, persistJson } from "./orchestrator.mjs";
import { executeWorker } from "./execute-worker.mjs";
import { supervise } from "./supervisor.mjs";
import { evaluateWatchdog } from "./watchdog.mjs";

export async function commission({ projectId, caseId, repository, candidateRevision, mandate, requiredAgents }) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required to execute real model workers.");

  const bound = bindCase({projectId,caseId,repository,candidateRevision,mandate});
  const ledger = createDispatchLedger(bound,requiredAgents);
  persistJson(`.plenum/cases/${bound.caseRunId}/bound.json`,bound);
  persistJson(`.plenum/cases/${bound.caseRunId}/ledger.json`,ledger);

  // Workers are deliberately separate model invocations. Failure is explicit, never silently skipped.
  for (const agentId of requiredAgents) {
    const input = JSON.stringify({
      institution:"Plenum AI Firm", projectId, caseId, repository, candidateRevision, mandate,
      instruction:"Perform only your bounded mandate. State evidence needed, findings, omissions, what should be, what should not be, uncertainty, and disposition. Do not claim runtime evidence you did not execute."
    });
    try {
      const record = await executeWorker({agentId,projectId,caseId,candidateRevision,input});
      ledger.executions.push({agentId,runId:record.run_id,disposition:record.disposition});
    } catch {
      ledger.executions.push({agentId,disposition:"FAILED"});
    }
    persistJson(`.plenum/cases/${bound.caseRunId}/ledger.json`,ledger);
  }

  const primary = await executeWorker({
    agentId:"primary_orchestrator",projectId,caseId,candidateRevision,
    input:JSON.stringify({bound,ledger,instruction:"Synthesize the investigation. Do not close if evidence or coverage is incomplete."})
  });
  const primaryProposal={candidateRevision,output:primary.output};

  const supervisorModel = await executeWorker({
    agentId:"supervisory_orchestrator",projectId,caseId,candidateRevision,
    input:JSON.stringify({bound,ledger,primaryProposal,instruction:"Independently audit the investigation universe, dispatch, omissions, should-be analysis, research, evidence and proposed closure. Seek what the Primary missed."})
  });

  // Model supervision cannot waive mechanical incompleteness.
  const mechanicalSupervisor=supervise({ledger,primaryProposal});
  const supervisor={...mechanicalSupervisor,model_run_id:supervisorModel.run_id,model_output:supervisorModel.output};
  persistJson(`.plenum/cases/${bound.caseRunId}/supervisor.json`,supervisor);

  const watchdog=evaluateWatchdog({ledger,supervisor,claims:[]});
  persistJson(`.plenum/cases/${bound.caseRunId}/watchdog.json`,watchdog);

  return {bound,ledger,primary_run_id:primary.run_id,supervisor,watchdog};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path=process.argv[2];
  if(!path) throw new Error("Usage: node runtime/commission.mjs <commission.json>");
  const config=JSON.parse(fs.readFileSync(path,"utf8"));
  console.log(JSON.stringify(await commission(config),null,2));
}
