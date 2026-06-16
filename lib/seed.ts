import type { FennecData, Transaction } from "@/lib/types";

// Ported verbatim from prototype `seed()` (project/Fennec.dc.html).
// Transaction IDs are deterministic (tx_0, tx_1, …) instead of the
// prototype's random uid — IDs never affect financial aggregation, and
// determinism keeps parity tests stable. Used for unit tests, local dev,
// and the optional "load demo data" action.

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function seed(): FennecData {
  const clients = [
    { id: "c1", name: "شركة الواحة للاتصالات", contact: "أحمد المبروك", phone: "0913456789", email: "a.mabrouk@wahacom.ly", notes: "عقد إدارة شهري متجدد، يفضل التواصل صباحاً.", date: "2025-12-20" },
    { id: "c2", name: "مطاعم البحر المتوسط", contact: "سالم الفيتوري", phone: "0925551234", email: "salem@medsea.ly", notes: "سلسلة مطاعم، مهتمون بمحتوى الفيديو.", date: "2026-02-10" },
    { id: "c3", name: "بنك الجمهورية", contact: "هدى بن عامر", phone: "0911002030", email: "h.benamer@gumhouria.ly", notes: "إجراءات اعتماد بطيئة، فواتير رسمية مطلوبة.", date: "2026-01-15" },
    { id: "c4", name: "مهرجان طرابلس الدولي", contact: "خالد الزروق", phone: "0918887766", email: "khaled@tripolifest.ly", notes: "مشروع موسمي، مواعيد حساسة.", date: "2026-04-28" },
    { id: "c5", name: "متجر نسمة للأزياء", contact: "منى الشريف", phone: "0922334455", email: "mona@nasma.ly", notes: "متجر إلكتروني ناشئ.", date: "2026-03-22" },
    { id: "c6", name: "مجموعة النور التجارية", contact: "عبدالله النور", phone: "0917778899", email: "info@alnoor.ly", notes: "عميل محتمل من الفرص البيعية.", date: "2026-05-30" },
  ];
  const projects = [
    { id: "p1", name: "إدارة السوشيال ميديا", clientId: "c1", type: "retainer" as const, value: 36000, monthly: 3000, startDate: "2026-01-01", endDate: "2026-12-31", status: "active" as const, date: "2026-01-01" },
    { id: "p2", name: "فيديو ترويجي - سلسلة المطاعم", clientId: "c2", type: "oneoff" as const, value: 18000, startDate: "2026-03-01", endDate: "2026-05-15", status: "completed" as const, date: "2026-03-01" },
    { id: "p3", name: "تصميم الهوية البصرية", clientId: "c3", type: "oneoff" as const, value: 45000, startDate: "2026-02-10", endDate: "2026-07-30", status: "active" as const, date: "2026-02-10" },
    { id: "p4", name: "تغطية مهرجان طرابلس", clientId: "c4", type: "oneoff" as const, value: 60000, startDate: "2026-05-20", endDate: "2026-06-05", status: "active" as const, date: "2026-05-18" },
    { id: "p5", name: "إدارة الحملات الإعلانية", clientId: "c5", type: "retainer" as const, value: 24000, monthly: 2000, startDate: "2026-04-01", endDate: "2027-03-31", status: "active" as const, date: "2026-04-01" },
  ];
  const invoices = [
    { id: "inv1", number: "FN-2026-001", projectId: "p2", clientId: "c2", issueDate: "2026-03-05", dueDate: "2026-03-20", items: [{ desc: "دفعة أولى - فيديو ترويجي", amount: 9000 }], status: "paid" as const, paidAmount: 9000, date: "2026-03-05" },
    { id: "inv2", number: "FN-2026-002", projectId: "p3", clientId: "c3", issueDate: "2026-02-12", dueDate: "2026-02-27", items: [{ desc: "دفعة مقدمة - الهوية البصرية", amount: 22500 }], status: "paid" as const, paidAmount: 22500, date: "2026-02-12" },
    { id: "inv3", number: "FN-2026-003", projectId: "p2", clientId: "c2", issueDate: "2026-05-10", dueDate: "2026-05-25", items: [{ desc: "الدفعة النهائية - فيديو ترويجي", amount: 9000 }], status: "paid" as const, paidAmount: 9000, date: "2026-05-10" },
    { id: "inv4", number: "FN-2026-004", projectId: "p4", clientId: "c4", issueDate: "2026-06-01", dueDate: "2026-06-08", items: [{ desc: "تغطية المهرجان - دفعة أولى", amount: 30000 }, { desc: "معدات تصوير إضافية", amount: 30000 }], status: "sent" as const, paidAmount: 0, date: "2026-06-01" },
    { id: "inv5", number: "FN-2026-005", projectId: "p1", clientId: "c1", issueDate: "2026-06-01", dueDate: "2026-06-30", items: [{ desc: "اشتراك يونيو - إدارة سوشيال ميديا", amount: 3000 }], status: "sent" as const, paidAmount: 0, date: "2026-06-01" },
  ];

  const transactions: Transaction[] = [];
  let n = 0;
  const addTx = (o: Omit<Transaction, "id">) => transactions.push({ id: "tx_" + n++, ...o });

  // retainer revenue p1 jan-jun
  ["2026-01-08", "2026-02-07", "2026-03-08", "2026-04-07", "2026-05-08", "2026-06-09"].forEach((d, i) =>
    addTx({ type: "revenue", amount: 3000, projectId: "p1", desc: "اشتراك شهري - " + AR_MONTHS[i], date: d }),
  );
  // p2 video
  addTx({ type: "revenue", amount: 9000, projectId: "p2", invoiceId: "inv1", desc: "دفعة أولى فيديو ترويجي", date: "2026-03-18" });
  addTx({ type: "revenue", amount: 9000, projectId: "p2", invoiceId: "inv3", desc: "دفعة نهائية فيديو ترويجي", date: "2026-05-22" });
  // p3 identity
  addTx({ type: "revenue", amount: 22500, projectId: "p3", invoiceId: "inv2", desc: "دفعة مقدمة الهوية البصرية", date: "2026-02-25" });
  addTx({ type: "revenue", amount: 22500, projectId: "p3", desc: "دفعة نهائية الهوية البصرية", date: "2026-06-12" });
  // p5 campaign
  addTx({ type: "revenue", amount: 2000, projectId: "p5", desc: "اشتراك أبريل - حملات", date: "2026-04-10" });
  addTx({ type: "revenue", amount: 2000, projectId: "p5", desc: "اشتراك مايو - حملات", date: "2026-05-11" });
  addTx({ type: "revenue", amount: 2000, projectId: "p5", desc: "اشتراك يونيو - حملات", date: "2026-06-10" });
  // costs
  addTx({ type: "cost", amount: 800, projectId: "p1", desc: "مصمم جرافيك مستقل", date: "2026-02-15" });
  addTx({ type: "cost", amount: 800, projectId: "p1", desc: "مصمم جرافيك مستقل", date: "2026-04-15" });
  addTx({ type: "cost", amount: 4000, projectId: "p2", desc: "مصور فيديو", date: "2026-03-12" });
  addTx({ type: "cost", amount: 1500, projectId: "p2", desc: "مونتاج وتعديل", date: "2026-04-05" });
  addTx({ type: "cost", amount: 3000, projectId: "p3", desc: "رسوم خطوط ومكتبة صور", date: "2026-02-20" });
  addTx({ type: "cost", amount: 12000, projectId: "p4", desc: "طاقم تصوير وإضاءة للمهرجان", date: "2026-05-28" });
  // overhead each month
  [0, 1, 2, 3, 4, 5].forEach((i) => {
    const mm = String(i + 1).padStart(2, "0");
    addTx({ type: "overhead", amount: 6000, category: "salaries", desc: "رواتب الموظفين", date: "2026-" + mm + "-28" });
    addTx({ type: "overhead", amount: 2500, category: "rent", desc: "إيجار المكتب", date: "2026-" + mm + "-01" });
    addTx({ type: "overhead", amount: 600, category: "internet", desc: "إنترنت واشتراكات برامج", date: "2026-" + mm + "-03" });
  });
  addTx({ type: "overhead", amount: 1200, category: "operations", desc: "ضيافة واجتماعات عملاء", date: "2026-05-19" });
  addTx({ type: "overhead", amount: 900, category: "operations", desc: "مصاريف تشغيلية متنوعة", date: "2026-06-06" });

  const leads = [
    { id: "l1", name: "حملة رمضان التسويقية", clientId: "c6", value: 30000, stage: "proposal" as const, date: "2026-05-30" },
    { id: "l2", name: "تصوير منتجات الأزياء", clientId: "c5", value: 8000, stage: "contact" as const, date: "2026-06-02" },
    { id: "l3", name: "إدارة حسابات البنك الرقمية", clientId: "c3", value: 40000, stage: "negotiation" as const, date: "2026-05-12" },
    { id: "l4", name: "فيديو إعلاني قصير", clientId: "c2", value: 15000, stage: "lost" as const, lostReason: "price" as const, date: "2026-04-18" },
    { id: "l5", name: "الهوية البصرية للبنك", clientId: "c3", value: 45000, stage: "won" as const, date: "2026-02-08" },
  ];
  const fixedExpenses = [
    { id: "fx1", name: "رواتب الموظفين", amount: 6000, category: "salaries" as const, date: "2026-01-01", lastGen: "2026-06" },
    { id: "fx2", name: "إيجار المكتب", amount: 2500, category: "rent" as const, date: "2026-01-01", lastGen: "2026-06" },
    { id: "fx3", name: "إنترنت واشتراكات برامج", amount: 600, category: "internet" as const, date: "2026-01-01", lastGen: "2026-06" },
  ];

  return { clients, projects, invoices, transactions, leads, fixedExpenses };
}

/** The prototype's fixed "now" — used by tests and as the demo reference date. */
export const PROTOTYPE_NOW = new Date(2026, 5, 14);
