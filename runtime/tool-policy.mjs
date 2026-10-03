import { githubTools } from "./tools/github.mjs";
import { liveWebSearch, researchInstructions } from "./tools/web.mjs";

const researchAgents=new Set([
  "standards_researcher","business_institution_researcher","design_council_researcher",
  "comparative_intelligence","requirements_mapper","should_be_architect","first_principles_challenger"
]);

const repositoryAgents=new Set([
  "repository_mapper","runtime_mapper","requirements_mapper","historical_claim_reconciler",
  "product_architect","information_architect","journey_specialist","interaction_specialist",
  "visual_design_specialist","language_editor","accessibility_specialist","architecture_specialist",
  "backend_data_specialist","security_privacy_specialist","safety_specialist",
  "reliability_resilience_specialist","performance_scale_specialist","economics_payments_specialist",
  "operations_support_specialist","omission_hunter","contradiction_hunter","stale_claim_hunter",
  "journey_breaker","regression_hunter","unnecessary_thing_critic","completeness_auditor",
  "should_be_architect","independent_verifier"
]);

export function toolsForAgent(agentId){
  const tools=[];
  if(repositoryAgents.has(agentId)) tools.push(...githubTools);
  if(researchAgents.has(agentId)) tools.push(liveWebSearch);
  return tools;
}

export function extraInstructionsForAgent(agentId){
  return researchAgents.has(agentId) ? researchInstructions : "";
}
