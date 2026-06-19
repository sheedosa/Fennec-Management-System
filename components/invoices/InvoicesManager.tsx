"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Invoice, Locale, OrgRole } from "@/lib/types";
import { L, fmtDate } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { invEffStatus, invTotal, invRemaining } from "@/lib/finance/invoice";
import { Card, SectionHead } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { Table, type Column } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toaster";
import { createInvoice, updateInvoice, deleteInvoice, recordPayment, getInvoiceFileUrl } from "@/actions/invoices";

interface ProjOpt { id: string; name: string }
interface ClientOpt { id: string; name: string }
type Row = { iv: Invoice; eff: string; total: number };

export function InvoicesManager({
  invoices,
  projects,
  locale,
  role,
  nowISO,
}: {
  invoices: Invoice[];
  projects: ProjOpt[];
  clients: ClientOpt[];
  locale: Locale;
  role: OrgRole;
  nowISO: string;
}) {
  const router = useRouter();
  const now = new Date(nowISO);
  const [editing, setEditing] = useState<Invoice | "new" | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [busy, setBusy] = useState(false);

  const projectName = (id?: string | null) => (id ? projects.find((p) => p.id === id)?.name ?? "—" : "—");

  const rows: Row[] = invoices.map((iv) => ({ iv, eff: invEffStatus(iv, now), total: invTotal(iv) }));
  const receivables = rows.filter((r) => r.eff === "sent" || r.eff === "overdue").reduce((a, r) => a + (r.total - (r.iv.paidAmount || 0)), 0);
  const overdueCount = rows.filter((r) => r.eff === "overdue").length;

  async function viewFile(id: string) {
    const res = await getInvoiceFileUrl(id);
    if (res.url) window.open(res.url, "_blank");
    else toast.error(res.error || L("لا يوجد ملف", "No file", locale));
  }
  async function onDelete(iv: Invoice) {
    if (!confirm(L("حذف هذه الفاتورة؟", "Delete this invoice?", locale))) return;
    const res = await deleteInvoice(iv.id);
    if (res.ok) {
      toast.success(L("تم الحذف", "Deleted", locale));
      router.refresh();
    } else toast.error(res.error || "خطأ");
  }

  const columns: Column<Row>[] = [
    { key: "number", header: L("رقم الفاتورة", "Invoice #", locale), render: (r) => <span dir="ltr" style={{ fontWeight: 700 }}>{r.iv.number}</span> },
    { key: "project", header: L("المشروع", "Project", locale), render: (r) => projectName(r.iv.projectId) },
    { key: "due", header: L("الاستحقاق", "Due", locale), render: (r) => fmtDate(r.iv.dueDate, locale) },
    { key: "amount", header: L("المبلغ", "Amount", locale), align: "end", render: (r) => <span className="fx-num">{money(r.total, locale)}</span> },
    { key: "remaining", header: L("المتبقي", "Remaining", locale), align: "end", render: (r) => <span className="fx-num">{money(invRemaining(r.iv), locale)}</span> },
    { key: "status", header: L("الحالة", "Status", locale), render: (r) => <StatusBadge status={r.eff} locale={locale} /> },
    {
      key: "actions",
      header: L("إجراءات", "Actions", locale),
      align: "end",
      render: (r) => (
        <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {r.eff !== "paid" ? <Button size="sm" variant="secondary" onClick={() => setPaying(r.iv)}>{L("دفعة", "Pay", locale)}</Button> : null}
          {r.iv.filePath ? <Button size="sm" variant="ghost" onClick={() => viewFile(r.iv.id)}>{L("الملف", "File", locale)}</Button> : null}
          <Button size="sm" variant="ghost" onClick={() => setEditing(r.iv)}>{L("تعديل", "Edit", locale)}</Button>
          {role === "manager" ? <Button size="sm" variant="danger" onClick={() => onDelete(r.iv)}>{L("حذف", "Delete", locale)}</Button> : null}
        </div>
      ),
    },
  ];

  const stat = (label: string, val: string, tone?: "danger") => (
    <Card style={{ padding: "18px" }}>
      <div style={{ fontSize: "13px", color: "var(--fg-muted)" }}>{label}</div>
      <div className="fx-num" style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px", color: tone === "danger" ? "var(--danger)" : "var(--fg)" }}>{val}</div>
    </Card>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead
        title={L("الفواتير", "Invoices", locale)}
        sub={L("أنشئ فاتورة ببنود أو ارفع ملفاً، واربطها بمشروع.", "Build a line-item invoice or upload a file, linked to a project.", locale)}
        actions={<Button onClick={() => setEditing("new")}>{L("+ فاتورة جديدة", "+ New Invoice", locale)}</Button>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px", marginBottom: "20px" }}>
        {stat(L("إجمالي المستحقات", "Total Receivables", locale), money(receivables, locale))}
        {stat(L("فواتير متأخرة", "Overdue", locale), String(overdueCount), overdueCount ? "danger" : undefined)}
        {stat(L("إجمالي الفواتير", "Total Invoices", locale), String(invoices.length))}
      </div>
      <Card style={{ overflow: "hidden" }}>
        <Table
          columns={columns}
          rows={rows}
          rowKey={(r) => r.iv.id}
          empty={<EmptyState message={L("لا توجد فواتير بعد", "No invoices yet", locale)} />}
        />
      </Card>

      {editing ? (
        <InvoiceModal
          key={editing === "new" ? "new" : editing.id}
          invoice={editing === "new" ? null : editing}
          projects={projects}
          locale={locale}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={async (fd) => {
            setBusy(true);
            const res = editing === "new" ? await createInvoice(fd) : await updateInvoice(fd);
            setBusy(false);
            if (res.ok) {
              toast.success(L("تم الحفظ", "Saved", locale));
              setEditing(null);
              router.refresh();
            } else toast.error(res.error || "خطأ");
          }}
        />
      ) : null}

      {paying ? (
        <PaymentModal
          invoice={paying}
          locale={locale}
          remaining={invRemaining(paying)}
          busy={busy}
          onClose={() => setPaying(null)}
          onSubmit={async (amount, date) => {
            setBusy(true);
            const res = await recordPayment(paying.id, amount, date);
            setBusy(false);
            if (res.ok) {
              toast.success(L("تم تسجيل الدفعة", "Payment recorded", locale));
              setPaying(null);
              router.refresh();
            } else toast.error(res.error || "خطأ");
          }}
        />
      ) : null}
    </div>
  );
}

function InvoiceModal({
  invoice,
  projects,
  locale,
  busy,
  onClose,
  onSubmit,
}: {
  invoice: Invoice | null;
  projects: ProjOpt[];
  locale: Locale;
  busy: boolean;
  onClose: () => void;
  onSubmit: (fd: FormData) => void;
}) {
  const [mode, setMode] = useState<"build" | "upload">(invoice?.filePath ? "upload" : "build");
  const [items, setItems] = useState<{ desc: string; amount: string }[]>(
    invoice && invoice.items.length && !invoice.filePath
      ? invoice.items.map((i) => ({ desc: i.desc, amount: String(i.amount) }))
      : [{ desc: "", amount: "" }],
  );
  const today = new Date().toISOString().slice(0, 10);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("mode", mode);
    if (mode === "build") fd.set("items", JSON.stringify(items.map((i) => ({ desc: i.desc, amount: Number(i.amount) || 0 }))));
    onSubmit(fd);
  };

  return (
    <Modal open onClose={onClose} title={invoice ? L("تعديل فاتورة", "Edit Invoice", locale) : L("فاتورة جديدة", "New Invoice", locale)} size="lg">
      <form onSubmit={submit}>
        {invoice ? <input type="hidden" name="id" defaultValue={invoice.id} /> : null}
        <div className="fx-2col">
          <Field label={L("رقم الفاتورة", "Invoice #", locale)}>
            <Input name="number" defaultValue={invoice?.number} dir="ltr" required placeholder="FN-2026-001" />
          </Field>
          <Field label={L("المشروع", "Project", locale)}>
            <Select name="projectId" defaultValue={invoice?.projectId ?? ""} required>
              <option value="" disabled>{L("اختر المشروع", "Select a project", locale)}</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label={L("تاريخ الإصدار", "Issue Date", locale)}>
            <Input type="date" name="issueDate" defaultValue={invoice?.issueDate ?? today} required />
          </Field>
          <Field label={L("تاريخ الاستحقاق", "Due Date", locale)}>
            <Input type="date" name="dueDate" defaultValue={invoice?.dueDate ?? today} required />
          </Field>
          <Field label={L("الحالة", "Status", locale)}>
            <Select name="status" defaultValue={invoice?.status ?? "draft"}>
              <option value="draft">{L("مسودة", "Draft", locale)}</option>
              <option value="sent">{L("مُرسلة", "Sent", locale)}</option>
              <option value="paid">{L("مدفوعة", "Paid", locale)}</option>
            </Select>
          </Field>
        </div>

        {/* mode toggle */}
        <div style={{ display: "inline-flex", gap: "2px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "3px", margin: "6px 0 14px" }}>
          {(["build", "upload"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} style={{ padding: "7px 14px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700, background: mode === m ? "var(--accent)" : "transparent", color: mode === m ? "var(--accent-contrast)" : "var(--fg-muted)" }}>
              {m === "build" ? L("بنود", "Line items", locale) : L("رفع ملف", "Upload file", locale)}
            </button>
          ))}
        </div>

        {mode === "build" ? (
          <div>
            {items.map((it, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <Input style={{ flex: 1 }} placeholder={L("وصف البند", "Item description", locale)} value={it.desc} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))} />
                <Input style={{ width: "120px" }} placeholder="0" inputMode="decimal" value={it.amount} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} />
                {items.length > 1 ? <Button type="button" size="sm" variant="ghost" onClick={() => setItems(items.filter((_, j) => j !== i))}>✕</Button> : null}
              </div>
            ))}
            <Button type="button" size="sm" variant="secondary" onClick={() => setItems([...items, { desc: "", amount: "" }])}>{L("+ إضافة بند", "+ Add Item", locale)}</Button>
          </div>
        ) : (
          <div className="fx-2col">
            <Field label={L("قيمة الفاتورة (د.ل)", "Invoice total (LYD)", locale)}>
              <Input name="total" inputMode="decimal" defaultValue={invoice?.items[0]?.amount ?? ""} placeholder="0" />
            </Field>
            <Field label={L("ملف الفاتورة (PDF/صورة)", "Invoice file (PDF/image)", locale)} hint={L("حتى 10 ميجابايت", "Up to 10 MB", locale)}>
              <Input type="file" name="file" accept="application/pdf,image/png,image/jpeg,image/webp" />
            </Field>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <Button type="button" variant="ghost" onClick={onClose}>{L("إلغاء", "Cancel", locale)}</Button>
          <Button type="submit" loading={busy}>{L("حفظ الفاتورة", "Save Invoice", locale)}</Button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentModal({
  invoice,
  locale,
  remaining,
  busy,
  onClose,
  onSubmit,
}: {
  invoice: Invoice;
  locale: Locale;
  remaining: number;
  busy: boolean;
  onClose: () => void;
  onSubmit: (amount: number, date: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const amount = parseFloat(String(fd.get("amount") || "").replace(/,/g, ""));
    onSubmit(amount, String(fd.get("payDate") || today));
  };
  return (
    <Modal open onClose={onClose} title={L("تسجيل دفعة", "Record Payment", locale)} size="sm">
      <form onSubmit={submit}>
        <div style={{ fontSize: "13.5px", color: "var(--fg-muted)", marginBottom: "14px" }}>
          {L("فاتورة: ", "Invoice: ", locale)}<span dir="ltr">{invoice.number}</span> — {L("المتبقي: ", "Remaining: ", locale)}<span className="fx-num">{money(remaining, locale)}</span>
        </div>
        <Field label={L("المبلغ المستلم (د.ل)", "Amount Received (LYD)", locale)}>
          <Input name="amount" inputMode="decimal" defaultValue={String(remaining)} required />
        </Field>
        <Field label={L("تاريخ الدفع", "Payment Date", locale)}>
          <Input type="date" name="payDate" defaultValue={today} required />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <Button type="button" variant="ghost" onClick={onClose}>{L("إلغاء", "Cancel", locale)}</Button>
          <Button type="submit" loading={busy}>{L("تسجيل الدفعة", "Record Payment", locale)}</Button>
        </div>
      </form>
    </Modal>
  );
}
