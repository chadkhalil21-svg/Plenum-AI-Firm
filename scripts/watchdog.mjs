import fs from "node:fs";

const config = JSON.parse(fs.readFileSync("config/watchdog.json", "utf8"));
if (config.failure_policy !== "FAIL_CLOSED") {
  throw new Error("Watchdog must fail closed.");
}
if (!Array.isArray(config.blocking_invariants) || config.blocking_invariants.length === 0) {
  throw new Error("No blocking invariants configured.");
}

const required = [
  "implementer_differs_from_verifier_for_material_repairs",
  "primary_orchestrator_does_not_self_certify",
  "supervisory_orchestrator_review_present_before_closure",
  "no_unresolved_blocking_claims"
];
for (const invariant of required) {
  if (!config.blocking_invariants.includes(invariant)) {
    throw new Error(`Missing invariant: ${invariant}`);
  }
}
console.log(`WATCHDOG CONFIGURATION PASS (${config.blocking_invariants.length} blocking invariants)`);
