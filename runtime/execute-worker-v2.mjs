import crypto from "node:crypto";
import fs from "node:fs";
import { run } from "@openai/agents";
import { requireAgent } from "./agents-v2.mjs";

const hash=v=>crypto.createHash("sha256").update(String(v)).digest("hex");

export async function executeWorker({agentId,projectId,caseId,candidateRevision,input,outputDir=".plenum/runs"}){
  const agent=requireAgent(agentId);
  const runId=crypto.randomUUID();
  const startedAt=new Date().toISOString();
  try{
    const result=await run(agent,input,{
      workflowName:`Plenum AI Firm / ${projectId} / ${caseId}`,
      traceMetadata:{run_id:runId,agent_id:agentId,candidate_revision:candidateRevision},
      maxTurns:Number(process.env.PLENUM_MAX_TURNS||20)
    });
    const output=result.finalOutput??"";
    const record={
      run_id:runId,project_id:projectId,case_id:caseId,agent_id:agentId,
      candidate_revision:candidateRevision,provider:"openai",
      model:process.env.PLENUM_MODEL||"gpt-5.6-sol",
      started_at:startedAt,ended_at:new Date().toISOString(),
      input_hash:hash(input),output_hash:hash(output),
      disposition:"COMPLETED",output,
      trace_available:true
    };
    fs.mkdirSync(outputDir,{recursive:true});
    fs.writeFileSync(`${outputDir}/${runId}.json`,JSON.stringify(record,null,2)+"\n");
    return record;
  }catch(error){
    fs.mkdirSync(outputDir,{recursive:true});
    fs.writeFileSync(`${outputDir}/${runId}.json`,JSON.stringify({
      run_id:runId,agent_id:agentId,candidate_revision:candidateRevision,
      disposition:"FAILED",error:String(error?.stack||error)
    },null,2)+"\n");
    throw error;
  }
}
