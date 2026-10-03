import { webSearchTool } from "@openai/agents";

export const liveWebSearch = webSearchTool({
  searchContextSize: "high"
});

export const researchInstructions = `
Use live web search whenever a material proposition depends on current standards,
platform/provider behavior, comparative practice, institutional guidance, design practice,
law/regulation, scientific/professional evidence, or another changeable external fact.
Prefer primary authoritative sources. Record publisher, title, URL, date/version when
available, access date, scope, proposition, authority class, and material counterevidence.
Never present a recommendation, exemplar, or house standard as law.
`;
