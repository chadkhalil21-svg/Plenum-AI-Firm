export function evaluateWatchdog({ ledger, supervisor, claims = [] }) {
  const failures = [];
  if (!supervisor?.approvedForWatchdog) failures.push("supervisor_not_approved");
  if (!ledger.supervisorReviewed) failures.push("supervisor_model_review_missing");
  if (!ledger.arbiterAdjudicated) failures.push("evidence_arbiter_missing");

  for (const agent of ledger.requiredAgents) {
    if (!ledger.executions.some(x => x.agentId === agent && x.disposition === "COMPLETED")) failures.push(`agent_missing:${agent}`);
  }

  for (const authorityAgent of ["authority_discovery_researcher","authority_selection_auditor"]) {
    if (!ledger.executions.some(x => x.agentId === authorityAgent && x.disposition === "COMPLETED")) failures.push(`authority_audit_missing:${authorityAgent}`);
  }

  if (ledger.unresolvedClaims.length) failures.push("unresolved_claims");
  if (!claims.length) failures.push("no_structured_claims");
  const denominatorEvidence = new Map();
  for (const execution of ledger.executions) for (const d of execution.denominators || []) {
    if (!denominatorEvidence.has(d.name)) denominatorEvidence.set(d.name, []);
    denominatorEvidence.get(d.name).push(d);
  }
  for (const name of ledger.coverageDenominators || []) {
    const evidence = denominatorEvidence.get(name) || [];
    if (!evidence.length) failures.push("denominator_unaccounted:" + name);
    else if (!evidence.some(d => d.disposition === "RECONCILED" || d.disposition === "NOT_APPLICABLE")) failures.push("denominator_unreconciled:" + name);
  }
  for (const claim of claims) {
    if (claim.candidate_revision !== ledger.candidateRevision) failures.push(`stale_claim:${claim.claim_id}`);
    if (claim.implementer && claim.verifier && claim.implementer === claim.verifier) failures.push(`self_verification:${claim.claim_id}`);
  }
  return { pass: failures.length === 0, failures, candidateRevision: ledger.candidateRevision };
}
