import { z } from "zod";

export const findingSchema=z.object({
  claim_id:z.string(),
  category:z.enum(["DEFECT","RECOMMENDATION","BLOCKER","HOUSE_STANDARD","NOT_TESTED","IDEA","EXPERIMENT"]),
  proposition:z.string(),
  candidate_revision:z.string(),
  evidence:z.array(z.object({kind:z.string(),locator:z.string(),supports:z.string()})),
  confidence:z.enum(["HIGH","MEDIUM","LOW"]),
  blocking:z.boolean(),
  implementer:z.string().nullable(),
  verifier:z.string().nullable()
});

export const workerOutputSchema=z.object({
  summary:z.string(),
  findings:z.array(findingSchema),
  denominators:z.array(z.object({
    name:z.string(),
    total:z.number().int().nonnegative().nullable(),
    examined:z.number().int().nonnegative().nullable(),
    disposition:z.enum(["RECONCILED","PARTIAL","NOT_APPLICABLE","NOT_TESTED"]),
    evidence:z.string()
  })),
  omissions:z.array(z.string()),
  not_tested:z.array(z.string())
});

export const selectionOutputSchema=z.object({
  selectedAgents:z.array(z.string()),
  rationale:z.string(),
  coverageDomains:z.array(z.string()),
  denominatorPlan:z.array(z.object({name:z.string(),method:z.string(),status:z.enum(["PLANNED","NOT_APPLICABLE","UNRESOLVED"])})),
  knownRisks:z.array(z.string())
});

export const challengeOutputSchema=z.object({
  addAgents:z.array(z.string()),
  removeAgents:z.array(z.string()),
  rationale:z.string(),
  omittedDomains:z.array(z.string()),
  unresolvedRisks:z.array(z.string())
});
