// Domain types — the canonical in-app shape, matching the prototype's
// localStorage JSON (project/Fennec.dc.html `seed()`). The Supabase data
// layer maps DB rows to/from these at the boundary so the pure finance
// layer in lib/finance/* can be unit-tested against the original seed data.

export type ContractType = "oneoff" | "retainer";
export type ProjectStatus = "active" | "hold" | "completed" | "cancelled";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type TxType = "revenue" | "cost" | "overhead";
export type OverheadCategory = "salaries" | "rent" | "internet" | "operations";
export type LeadStage = "contact" | "proposal" | "negotiation" | "won" | "lost";
export type LostReason = "price" | "timing" | "competitor" | "noresponse" | "other";
export type Locale = "ar" | "en";

export interface Client {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  notes?: string;
  date: string; // YYYY-MM-DD
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  type: ContractType;
  value: number;
  monthly?: number; // present when type === "retainer"
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  date: string;
}

export interface InvoiceItem {
  desc: string;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  projectId?: string | null;
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  paidAmount: number;
  date: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  projectId?: string | null; // required for revenue/cost
  category?: OverheadCategory; // required for overhead
  invoiceId?: string | null;
  desc?: string;
  date: string;
  retainerYM?: string; // YYYY-MM dedup marker for generated retainer revenue
}

export interface Lead {
  id: string;
  name: string;
  clientId: string;
  value: number;
  stage: LeadStage;
  lostReason?: LostReason;
  date: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: OverheadCategory;
  date: string;
  lastGen: string; // YYYY-MM
}

export interface FennecData {
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  transactions: Transaction[];
  leads: Lead[];
  fixedExpenses: FixedExpense[];
}

export type Period = "month" | "quarter" | "year" | "all";
