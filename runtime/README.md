# Runtime

This directory is the executable control plane.

The runtime must:
- bind every case to a client repository and immutable candidate revision;
- create a dispatch ledger before specialist work;
- invoke workers separately and persist execution records;
- expose worker outputs to adversarial challenge;
- send the Primary Orchestrator's proposed closure to the Supervisory Orchestrator;
- run deterministic watchdog checks independently of model judgment;
- normalize claims and evidence before Evidence Arbiter review;
- prevent repair workers from acting as independent verifiers;
- invalidate revision-bound evidence when the candidate revision changes;
- require human approval for configured consequential actions.

A role manifest is not an agent execution. Only a persisted run record proves that a worker actually ran.
