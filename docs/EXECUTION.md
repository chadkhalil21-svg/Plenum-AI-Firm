# Executing the Firm

The repository now contains a real multi-invocation runtime using the OpenAI Agents SDK.

Each model worker is instantiated as its own Agent and executed through a separate `run()` call. The resulting execution is persisted locally under `.plenum/` with exact candidate revision, worker identity, provider/model, timestamps, hashes, disposition, and output. OpenAI tracing is also enabled by the SDK in supported server runtimes unless explicitly disabled.

The Primary Orchestrator runs after bounded workers. The Supervisory Orchestrator is then invoked separately to challenge the Primary investigation. A deterministic, non-model supervisor/watchdog layer independently blocks closure for mechanical incompleteness.

## Deliberate current limitation

Model workers do not yet possess a GitHub repository-reading tool or live-web research tool inside their runtime. Therefore they must not claim to have inspected code or current web evidence merely from their mandate. Those capabilities are the next adapters to implement. Until then, commissioning that requires them must remain NOT_TESTED/incomplete.

## Run

1. Install dependencies: `npm install`
2. Set `OPENAI_API_KEY` in the environment. Never commit it.
3. Replace the placeholder candidate revision in the commission manifest with the exact client SHA.
4. Run: `node runtime/commission.mjs projects/001-american-rider/commission.json`

A successful process execution is not a release certification. Closure still requires evidence, Supervisor review, watchdog pass, Arbiter adjudication, and configured human authority.
