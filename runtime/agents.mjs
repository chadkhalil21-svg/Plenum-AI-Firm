import { Agent } from "@openai/agents";
import fs from "node:fs";

const council = JSON.parse(fs.readFileSync("config/software-agent-council.json","utf8"));

const constitutional = `
You are a separately invoked worker of Plenum AI Firm.
Bind every claim to the exact candidate revision supplied.
Do not treat memory, historical audits, screenshots from another revision, or confidence as current evidence.
Investigate both what is and what should be. Identify omissions and unnecessary elements where relevant.
When external standards or comparative practice matter, require current sourced research and distinguish law, standards, platform requirements, guidance, research, exemplars, and house standards.
Unknown or unexecuted work is NOT_TESTED.
Return concise evidence-led findings. Do not certify your own implementation.
`;

export const agents = new Map(
  council.agents
    .filter(x => x.id !== "deterministic_watchdog")
    .map(spec => [spec.id, new Agent({
      name: spec.id,
      model: process.env.PLENUM_MODEL || "gpt-5.6-sol",
      instructions: `${constitutional}\nYour bounded mandate: ${spec.mandate}`
    })])
);

export function requireAgent(id) {
  const agent = agents.get(id);
  if (!agent) throw new Error(`Unknown model worker: ${id}`);
  return agent;
}
