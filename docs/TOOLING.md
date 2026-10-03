# Evidence Tooling

## Live web
Research-capable workers use OpenAI's hosted Web Search tool. This is used for current standards, platform/provider guidance, comparative practice, institutional research, design counsel, and other changeable external propositions. Primary sources are preferred and authority class must be recorded.

## GitHub
Repository-capable workers use narrow read-only GitHub REST tools:
- exact commit metadata;
- exhaustive recursive Git tree inventory;
- raw file read at an exact ref.

The GitHub adapter intentionally has no write capability. Investigation workers cannot mutate a client repository. Repair/write authority will be isolated behind a separate approval-gated adapter.

The recursive tree adapter fails closed if GitHub reports truncation, because an exhaustive repository claim cannot be made from a truncated inventory.

## Credentials
Use a least-privilege GitHub token/App credential in `GITHUB_TOKEN`. For client inspection it should have only the repository contents/metadata access actually required. Never commit credentials.

## Evidence discipline
Tool availability is not evidence of tool use. A worker must cite the concrete repository path/revision or external source used in its finding. OpenAI tracing records hosted/tool execution for runtime observability.
