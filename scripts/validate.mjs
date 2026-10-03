import fs from "node:fs";

const required = [
  "README.md",
  "docs/CONSTITUTION.md",
  "config/agents.json",
  "config/watchdog.json",
  "schemas/claim.schema.json",
  "projects/001-american-rider/project.json",
  "projects/001-american-rider/cases/INSURANCE-LAPSE-001.json"
];

let failed = false;
for (const path of required) {
  if (!fs.existsSync(path)) {
    console.error("MISSING", path);
    failed = true;
  }
}

const agents = JSON.parse(fs.readFileSync("config/agents.json", "utf8"));
const ids = new Set();
for (const agent of agents.agents) {
  if (ids.has(agent.id)) {
    console.error("DUPLICATE_AGENT", agent.id);
    failed = true;
  }
  ids.add(agent.id);
}

for (const id of ["primary_orchestrator","supervisory_orchestrator","deterministic_watchdog","evidence_arbiter","repair_engineer","independent_verifier"]) {
  if (!ids.has(id)) {
    console.error("MISSING_AUTHORITY", id);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("Plenum AI Firm institutional configuration: VALID");
