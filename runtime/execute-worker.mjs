import crypto from "node:crypto";
import fs from "node:fs";
import { run } from "@openai/agents";
import { requireAgent } from "./agents.mjs";

const hash = value => crypto.createHash("sha256").update(String(value)).digest("hex");

export async function executeWorker({ agentId, projectId, caseId, candidateRevision, input, outputDir=".plenum/runs" }) {
  const agent = requireAgent(agentId);
  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  try {
    const result = await run(agent, input, {
      workflowName: `Plenum AI Firm / ${projectId} / ${caseId}`,
      traceMetadata: { run_id: runId, agent_id: agentId, candidate_revision: candidateRevision },
      maxTurns: Number(process.env.PLENUM_MAX_TURNS || 12)
    });
    const output = result.finalOutput ?? "";
    const record = {
      run_id: runId, project_id: projectId, case_id: caseId, agent_id: agentId,
      candidate_revision: candidateRevision, provider: "openai",
      model: process.env.PLENUM_MODEL || "gpt-5.6-sol",
      started_at: startedAt, ended_at: new Date().toISOString(),
      input_hash: hash(input), output_hash: hash(output),
      tool_events: [], disposition: "COMPLETED", claims: [], output
    };
    fs.mkdirSync(outputDir,{recursive:true});
    fs.writeFileSync(`${outputDir}/${runId}.json`,JSON.stringify(record,null,2)+"\n");
    return record;
  } catch (error) {
    const record = {
      run_id: runId, project_id: projectId, case_id: caseId, agent_id: agentId,
      candidate_revision: candidateRevision, provider:"openai",
      model: process.env.PLENUM_MODEL || "gpt-5.6-sol",
      started_at: startedAt, ended_at:new Date().toISOString(),
      input_hash:hash(input), output_hash:hash(error?.message || error),
      tool_events:[], disposition:"FAILED", claims:[], error:String(error?.stack || error)
    };
    fs.mkdirSync(outputDir,{recursive:true});
    fs.writeFileSync(`${outputDir}/${runId}.json`,JSON.stringify(record,null,2)+"\n");
    throw error;
  }
}
