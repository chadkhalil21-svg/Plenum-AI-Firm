import crypto from "node:crypto";
import fs from "node:fs";

export function bindCase({ projectId, caseId, repository, candidateRevision, mandate }) {
  if (!candidateRevision || candidateRevision.length < 7) throw new Error("Exact candidate revision required.");
  return Object.freeze({
    caseRunId: crypto.randomUUID(),
    projectId, caseId, repository, candidateRevision, mandate,
    createdAt: new Date().toISOString(),
    phase: "BOUND"
  });
}

export function createDispatchLedger(boundCase, requiredAgents, coverageDenominators = []) {
  if (!Array.isArray(requiredAgents) || requiredAgents.length === 0) throw new Error("Required agents missing.");
  return {
    caseRunId: boundCase.caseRunId,
    candidateRevision: boundCase.candidateRevision,
    requiredAgents: [...new Set(requiredAgents)],
    coverageDenominators: [...new Set(coverageDenominators)],
    executions: [],
    unresolvedClaims: [],
    closureProposed: false,
    supervisorReviewed: false,
    watchdogPassed: false,
    arbiterAdjudicated: false
  };
}

export function assertRevision(record, candidateRevision) {
  if (record.candidateRevision !== candidateRevision) {
    throw new Error("STALE_EVIDENCE: candidate revision mismatch.");
  }
}

export function persistJson(path, value) {
  fs.mkdirSync(path.substring(0, path.lastIndexOf("/")), { recursive: true });
  fs.writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}
