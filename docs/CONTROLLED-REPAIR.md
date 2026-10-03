# Controlled Repair Protocol

Investigation and repair are separate authorities.

1. Commissioning binds findings to an immutable client revision.
2. The Evidence Arbiter determines which findings are sufficiently supported for repair.
3. Human authorization is required before client-repository writes are enabled.
4. Only the Repair Engineer receives write tools.
5. Repairs are made only on a `plenum/repair/*` branch created from the exact adjudicated base revision. The tools cannot target the default branch.
6. The Repair Engineer may create or replace files and open a pull request, but it cannot merge or deploy.
7. The resulting repair revision becomes a new immutable verification candidate.
8. Independent Verification, adversarial review, regression review, and the Supervisory Orchestrator evaluate that resulting revision.
9. The implementer cannot certify its own repair.
10. Human approval remains required for merge, production deployment, destructive actions, secrets changes, and legal representations.

## Credentials

Read-only investigation uses `CLIENT_GITHUB_TOKEN`.

Authorized repair uses a separate repository secret, `CLIENT_GITHUB_WRITE_TOKEN`, exposed to the runtime as `GITHUB_WRITE_TOKEN`. Apply least privilege and repository scope. The intended permissions are Contents: read/write and Pull requests: read/write for the selected client repository. Do not grant Administration, Actions, Secrets, or broader repository access merely for repair.

The repair capability remains disabled unless `PLENUM_REPAIR_AUTHORIZED=true` is explicitly set for the repair job.
