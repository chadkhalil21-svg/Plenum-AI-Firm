import { githubTools } from "./tools/github.mjs";
import { liveWebSearch, researchInstructions } from "./tools/web.mjs";
import { githubRepairTools } from "./tools/github-repair.mjs";

const researchAgents=new Set([
  "standards_researcher","business_institution_researcher","design_council_researcher",
  "comparative_intelligence","requirements_mapper","should_be_architect","first_principles_challenger",
  "authority_discovery_researcher","authority_selection_auditor","idea_generator","solution_architect","simulation_experiment_specialist","novelty_prior_art_challenger",
  "primary_orchestrator","supervisory_orchestrator","evidence_arbiter"
]);

const repositoryAgents=new Set([
  "repository_mapper","runtime_mapper","requirements_mapper","historical_claim_reconciler",
  "product_architect","information_architect","journey_specialist","interaction_specialist","hospitality_service_specialist","comprehension_specialist","responsive_device_specialist","localization_specialist",
  "visual_design_specialist","language_editor","accessibility_specialist","architecture_specialist",
  "backend_data_specialist","security_privacy_specialist","safety_specialist",
  "reliability_resilience_specialist","performance_scale_specialist","economics_payments_specialist",
  "operations_support_specialist","omission_hunter","contradiction_hunter","stale_claim_hunter",
  "journey_breaker","regression_hunter","unnecessary_thing_critic","completeness_auditor",
  "should_be_architect","first_principles_challenger","comparative_intelligence","idea_generator","solution_architect","simulation_experiment_specialist","stress_chaos_tester","independent_verifier","primary_orchestrator","supervisory_orchestrator",
  "authority_discovery_researcher","authority_selection_auditor","evidence_arbiter"
]);

export function toolsForAgent(agentId){
  const tools=[];
  if(repositoryAgents.has(agentId)) tools.push(...githubTools);
  if(agentId==="repair_engineer" && process.env.PLENUM_REPAIR_AUTHORIZED==="true") tools.push(...githubTools,...githubRepairTools);
  if(researchAgents.has(agentId)) tools.push(liveWebSearch);
  return tools;
}

export function extraInstructionsForAgent(agentId){
  return researchAgents.has(agentId) ? researchInstructions : "";
}
