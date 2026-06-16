import type { Lead, LeadStage } from "@/lib/types";

// Ported verbatim from prototype `renderPipeline()` aggregates.

/** Win-probability weights by stage (prototype `prob`). */
export const STAGE_PROB: Partial<Record<LeadStage, number>> = {
  contact: 0.2,
  proposal: 0.5,
  negotiation: 0.8,
};

export interface PipelineStats {
  weighted: number;
  winRate: number;
  won: number;
  lost: number;
}

export function pipelineStats(leads: Lead[]): PipelineStats {
  const won = leads.filter((l) => l.stage === "won").length;
  const lost = leads.filter((l) => l.stage === "lost").length;
  const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;
  const weighted = leads
    .filter((l) => STAGE_PROB[l.stage] != null)
    .reduce((a, l) => a + l.value * (STAGE_PROB[l.stage] as number), 0);
  return { weighted, winRate, won, lost };
}
