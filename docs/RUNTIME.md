# Runtime Architecture

Plenum AI Firm will use a code-owned orchestration runtime rather than treating role prompts as agents.

The initial implementation target is the OpenAI Agents SDK for TypeScript. The Firm owns deployment, storage, approvals, evidence persistence, client adapters, and deterministic policy. Model providers remain behind an adapter boundary.

## Control plane

Primary Orchestrator remains manager of a case. Specialists operate as bounded workers. The Supervisory Orchestrator receives the mandate, Primary plan, dispatch ledger, coverage ledger, unresolved claims, and proposed closure, and may veto closure but may not silently rewrite the Primary record.

The Deterministic Watchdog is ordinary code, not a language model.

The Evidence Arbiter receives normalized claims and evidence only after adversarial review. Repair workers are isolated from adjudication. Independent Verification operates on the resulting immutable revision.

## Runtime truth

An agent definition in configuration is not proof that an independent agent ran. A completed run must emit a traceable execution record with agent identity, model/provider, inputs or hashes, outputs, tool activity, timestamps, candidate revision, and disposition.

## Provider strategy

OpenAI is the initial provider. Provider-specific calls must stay behind an adapter so the Firm can later add independent model providers without changing institutional law.

## Secrets

No API keys, GitHub tokens, client secrets, or production credentials belong in this repository. Runtime secrets are injected through environment or a managed secret store.
