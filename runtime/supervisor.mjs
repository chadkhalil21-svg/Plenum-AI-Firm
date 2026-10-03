export function supervise({ ledger, primaryProposal }) {
  const omissions = [];
  for (const agent of ledger.requiredAgents) {
    if (!ledger.executions.some(x => x.agentId === agent && x.disposition === "COMPLETED")) {
      omissions.push(`Required worker not completed: ${agent}`);
    }
  }
  if (ledger.unresolvedClaims.length) omissions.push("Unresolved claims remain.");
  if (!primaryProposal?.candidateRevision || primaryProposal.candidateRevision !== ledger.candidateRevision) {
    omissions.push("Primary closure proposal is absent or bound to the wrong revision.");
  }
  return {
    candidateRevision: ledger.candidateRevision,
    approvedForWatchdog: omissions.length === 0,
    omissions
  };
}
