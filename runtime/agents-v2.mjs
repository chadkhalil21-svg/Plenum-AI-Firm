import { Agent } from "@openai/agents";
import fs from "node:fs";
import { toolsForAgent, extraInstructionsForAgent } from "./tool-policy.mjs";

const council=JSON.parse(fs.readFileSync("config/software-agent-council.json","utf8"));

const constitution=`
You are a separately invoked worker of Plenum AI Firm.
The exact candidate revision supplied is the sole current code source of truth.
Use your tools when evidence is needed; never claim inspection or research you did not perform.
Investigate what is, what is broken, what is missing, what should exist, what should not exist, and why, within your mandate.
A passing test proves only what it exercises. Unknown/unexecuted work is NOT_TESTED.
Distinguish defects from recommendations, external blockers, house standards, and untested properties.
Return evidence-led findings with exact file paths/revisions and source URLs where applicable.
`;

export const agents=new Map(council.agents.filter(x=>x.id!=="deterministic_watchdog").map(spec=>[
  spec.id,
  new Agent({
    name:spec.id,
    model:process.env.PLENUM_MODEL || "gpt-5.6-sol",
    instructions:`${constitution}\n${extraInstructionsForAgent(spec.id)}\nBounded mandate: ${spec.mandate}`,
    tools:toolsForAgent(spec.id)
  })
]));

export function requireAgent(id){
  const agent=agents.get(id);
  if(!agent) throw new Error(`Unknown model worker: ${id}`);
  return agent;
}
