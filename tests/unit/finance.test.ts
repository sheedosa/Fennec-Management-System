import { describe, it, expect } from "vitest";
import { seed, PROTOTYPE_NOW } from "@/lib/seed";
import { metrics } from "@/lib/finance/metrics";
import { money, num } from "@/lib/finance/money";
import { invEffStatus, invTotal, invRemaining, isOverdueProject } from "@/lib/finance/invoice";
import { periodRange, inPeriod, curYM, last6Months } from "@/lib/finance/period";
import { pipelineStats } from "@/lib/finance/pipeline";
import { clientLTV, clientPayments } from "@/lib/finance/client";
import { trendSeries, donutSegments, topClients, projectReturns } from "@/lib/finance/charts";

// Expected values are hand-derived from the prototype seed() at NOW=2026-06-14.
// Any drift here means a divergence from the frozen prototype's numbers.

const data = seed();
const NOW = PROTOTYPE_NOW;

describe("money / num", () => {
  it("formats rounded integers with locale suffix", () => {
    expect(money(87000, "ar")).toBe("87,000 د.ل");
    expect(money(87000, "en")).toBe("87,000 LYD");
    expect(money(8200)).toBe("8,200 د.ل");
    expect(money(0, "en")).toBe("0 LYD");
    expect(money(1234.6)).toBe("1,235 د.ل"); // Math.round
  });
  it("parses numbers, stripping commas, null on NaN", () => {
    expect(num("1,234.5")).toBe(1234.5);
    expect(num("5000")).toBe(5000);
    expect(num("abc")).toBeNull();
    expect(num("")).toBeNull();
  });
});

describe("metrics() parity across periods", () => {
  it("year", () => {
    const m = metrics(data, "year", NOW);
    expect(m.revenue).toBe(87000);
    expect(m.costs).toBe(22100);
    expect(m.overhead).toBe(56700);
    expect(m.net).toBe(8200);
    expect(m.margin).toBeCloseTo(9.4252873563, 8);
    expect(m.outstanding).toBe(63000);
    expect(m.active).toBe(4);
  });
  it("all (identical to year — all seed dates are in 2026)", () => {
    const m = metrics(data, "all", NOW);
    expect(m.revenue).toBe(87000);
    expect(m.costs).toBe(22100);
    expect(m.overhead).toBe(56700);
    expect(m.net).toBe(8200);
  });
  it("month (June 2026)", () => {
    const m = metrics(data, "month", NOW);
    expect(m.revenue).toBe(27500);
    expect(m.costs).toBe(0);
    expect(m.overhead).toBe(10000);
    expect(m.net).toBe(17500);
    expect(m.margin).toBeCloseTo(63.6363636364, 8);
    expect(m.outstanding).toBe(63000);
    expect(m.active).toBe(4);
  });
  it("quarter (Q2 2026)", () => {
    const m = metrics(data, "quarter", NOW);
    expect(m.revenue).toBe(46500);
    expect(m.costs).toBe(14300);
    expect(m.overhead).toBe(29400);
    expect(m.net).toBe(2800);
    expect(m.margin).toBeCloseTo(6.0215053763, 8);
    expect(m.outstanding).toBe(63000);
    expect(m.active).toBe(4);
  });
});

describe("invoice logic", () => {
  it("invEffStatus derives overdue for sent + past due", () => {
    const inv4 = data.invoices.find((i) => i.id === "inv4")!;
    const inv5 = data.invoices.find((i) => i.id === "inv5")!;
    const inv1 = data.invoices.find((i) => i.id === "inv1")!;
    expect(invEffStatus(inv4, NOW)).toBe("overdue"); // due 06-08 < 06-14
    expect(invEffStatus(inv5, NOW)).toBe("sent"); // due 06-30 > 06-14
    expect(invEffStatus(inv1, NOW)).toBe("paid");
  });
  it("invTotal / invRemaining", () => {
    const inv4 = data.invoices.find((i) => i.id === "inv4")!;
    expect(invTotal(inv4)).toBe(60000);
    expect(invRemaining(inv4)).toBe(60000);
    const inv1 = data.invoices.find((i) => i.id === "inv1")!;
    expect(invRemaining(inv1)).toBe(0);
  });
  it("isOverdueProject", () => {
    const p4 = data.projects.find((p) => p.id === "p4")!; // ends 06-05, active
    const p2 = data.projects.find((p) => p.id === "p2")!; // completed
    const p3 = data.projects.find((p) => p.id === "p3")!; // ends 07-30, active
    expect(isOverdueProject(p4, NOW)).toBe(true);
    expect(isOverdueProject(p2, NOW)).toBe(false);
    expect(isOverdueProject(p3, NOW)).toBe(false);
  });
});

describe("period helpers", () => {
  it("periodRange month/quarter/year/all", () => {
    expect(periodRange("all", NOW)).toBeNull();
    const month = periodRange("month", NOW)!;
    expect(month.s.getMonth()).toBe(5); // June
    expect(month.s.getDate()).toBe(1);
    const quarter = periodRange("quarter", NOW)!;
    expect(quarter.s.getMonth()).toBe(3); // April (Q2 start)
    const year = periodRange("year", NOW)!;
    expect(year.s.getMonth()).toBe(0);
  });
  it("inPeriod", () => {
    expect(inPeriod("2026-06-09", "month", NOW)).toBe(true);
    expect(inPeriod("2026-05-09", "month", NOW)).toBe(false);
    expect(inPeriod("2026-01-01", "year", NOW)).toBe(true);
    expect(inPeriod("2020-01-01", "all", NOW)).toBe(true);
  });
  it("curYM / last6Months", () => {
    expect(curYM(NOW)).toBe("2026-06");
    const months = last6Months(NOW);
    expect(months).toHaveLength(6);
    expect(months[0].m).toBe(0); // Jan
    expect(months[5].m).toBe(5); // Jun
  });
});

describe("pipeline", () => {
  it("weighted value and win rate", () => {
    const s = pipelineStats(data.leads);
    expect(s.weighted).toBe(48600); // .5*30000 + .2*8000 + .8*40000
    expect(s.winRate).toBe(50);
    expect(s.won).toBe(1);
    expect(s.lost).toBe(1);
  });
});

describe("client lifetime value", () => {
  it("LTV per client (all-time)", () => {
    expect(clientLTV(data, "c1")).toBe(18000);
    expect(clientLTV(data, "c2")).toBe(18000);
    expect(clientLTV(data, "c3")).toBe(45000);
    expect(clientLTV(data, "c4")).toBe(0);
    expect(clientLTV(data, "c5")).toBe(6000);
    expect(clientLTV(data, "c6")).toBe(0);
  });
  it("payment history newest first", () => {
    const pays = clientPayments(data, "c3");
    expect(pays).toHaveLength(2);
    expect(pays[0].date >= pays[1].date).toBe(true);
  });
});

describe("charts", () => {
  it("trendSeries — 6 months rev/exp", () => {
    const t = trendSeries(data, NOW);
    expect(t).toHaveLength(6);
    expect(t.map((x) => x.rev)).toEqual([3000, 25500, 12000, 5000, 14000, 27500]);
    expect(t.map((x) => x.exp)).toEqual([9100, 12900, 13100, 11400, 22300, 10000]);
  });
  it("donutSegments — period filtered, val>0 only", () => {
    const segs = donutSegments(data, "year", NOW);
    const byKey = Object.fromEntries(segs.map((s) => [s.key, s.val]));
    expect(byKey.projectCosts).toBe(22100);
    expect(byKey.salaries).toBe(36000); // 6000 * 6
    expect(byKey.rent).toBe(15000); // 2500 * 6
    expect(byKey.internet).toBe(3600); // 600 * 6
    expect(byKey.operations).toBe(2100); // 1200 + 900
  });
  it("topClients — top 5 by revenue", () => {
    const top = topClients(data, "year", NOW);
    expect(top[0].clientId).toBe("c3");
    expect(top[0].val).toBe(45000);
    const byClient = Object.fromEntries(top.map((r) => [r.clientId, r.val]));
    expect(byClient.c1).toBe(18000);
    expect(byClient.c2).toBe(18000);
    expect(byClient.c5).toBe(6000);
  });
  it("projectReturns — net per project", () => {
    const r = projectReturns(data, "year", NOW);
    const byId = Object.fromEntries(r.map((x) => [x.projectId, x]));
    expect(byId.p1).toMatchObject({ rev: 18000, cost: 1600, net: 16400 });
    expect(byId.p2).toMatchObject({ rev: 18000, cost: 5500, net: 12500 });
    expect(byId.p3).toMatchObject({ rev: 45000, cost: 3000, net: 42000 });
    expect(byId.p4).toMatchObject({ rev: 0, cost: 12000, net: -12000 });
    expect(byId.p5).toMatchObject({ rev: 6000, cost: 0, net: 6000 });
  });
});
