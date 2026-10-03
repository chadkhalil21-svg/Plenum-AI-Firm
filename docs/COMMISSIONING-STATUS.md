# Project 001 Commissioning Status

## Bound candidate
American Rider is bound to:
`f749644c862e1da128359ddf2693a95506b9b52a`

This SHA was resolved from the current American Rider repository before the commissioning manifest was updated.

## Runtime
The V2 commissioning pipeline is wired to:
- separately execute required workers;
- permit exact-revision GitHub inspection for repository-capable workers;
- permit live web research for research-capable workers;
- execute the Primary Orchestrator after bounded workers;
- separately execute the Supervisory Orchestrator;
- apply a deterministic watchdog after supervision;
- persist run artifacts;
- preserve evidence as a GitHub Actions artifact.

## Execution gate
The workflow requires repository secrets:
- `OPENAI_API_KEY`
- `CLIENT_GITHUB_TOKEN`

No secret is stored in source control.

Until a workflow run completes with these credentials, the Firm must not claim that Project 001 has actually been commissioned by the independent runtime. Configuration is READY TO EXECUTE; commissioning evidence is NOT YET PRODUCED.
