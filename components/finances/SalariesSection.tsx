"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee, Locale, OrgRole } from "@/lib/types";
import { L } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { Table, type Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toaster";
import { createEmployee, updateEmployee, deleteEmployee, logMonthSalaries } from "@/actions/employees";

export function SalariesSection({
  employees,
  pending,
  monthlyTotal,
  locale,
  role,
}: {
  employees: Employee[];
  pending: number;
  monthlyTotal: number;
  locale: Locale;
  role: OrgRole;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Employee | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  async function onDelete(e: Employee) {
    if (!confirm(L("حذف هذا الموظف؟", "Delete this employee?", locale))) return;
    const res = await deleteEmployee(e.id);
    if (res.ok) { toast.success(L("تم الحذف", "Deleted", locale)); router.refresh(); } else toast.error(res.error || "خطأ");
  }
  async function logSalaries() {
    setBusy(true);
    const res = await logMonthSalaries();
    setBusy(false);
    if (res.ok) { toast.success(res.count ? L(`تم تسجيل رواتب ${res.count} موظف`, `Logged ${res.count} salaries`, locale) : L("لا رواتب مستحقة هذا الشهر", "No salaries due this month", locale)); router.refresh(); }
    else toast.error(res.error || "خطأ");
  }

  const columns: Column<Employee>[] = [
    { key: "name", header: L("الموظف", "Employee", locale), render: (e) => <span style={{ fontWeight: 700 }}>{e.name}</span> },
    { key: "role", header: L("الدور", "Role", locale), render: (e) => e.role || "—" },
    { key: "salary", header: L("الراتب الشهري", "Monthly Salary", locale), align: "end", render: (e) => <span className="fx-num">{money(e.monthlySalary, locale)}</span> },
    { key: "status", header: L("الحالة", "Status", locale), render: (e) => (e.active ? <Badge tone="success" dot>{L("نشط", "Active", locale)}</Badge> : <Badge tone="neutral">{L("غير نشط", "Inactive", locale)}</Badge>) },
    {
      key: "actions", header: "", align: "end",
      render: (e) => (
        <div style={{ display: "inline-flex", gap: "6px" }}>
          <Button size="sm" variant="ghost" onClick={() => setEditing(e)}>{L("تعديل", "Edit", locale)}</Button>
          {role === "manager" ? <Button size="sm" variant="danger" onClick={() => onDelete(e)}>{L("حذف", "Delete", locale)}</Button> : null}
        </div>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: "26px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--fg)" }}>{L("الرواتب والموظفون", "Salaries & Employees", locale)}</h2>
          <div style={{ fontSize: "13px", color: "var(--fg-muted)", marginTop: "3px" }}>{L("إجمالي شهري:", "Monthly total:", locale)} <span className="fx-num" style={{ fontWeight: 700 }}>{money(monthlyTotal, locale)}</span></div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" loading={busy} onClick={logSalaries}>
            {pending ? L(`تسجيل رواتب هذا الشهر (${pending})`, `Log this month (${pending})`, locale) : L("رواتب هذا الشهر مسجّلة", "This month logged", locale)}
          </Button>
          <Button onClick={() => setEditing("new")}>{L("+ موظف", "+ Employee", locale)}</Button>
        </div>
      </div>
      <Card style={{ overflow: "hidden" }}>
        <Table columns={columns} rows={employees} rowKey={(e) => e.id} empty={<EmptyState message={L("لا يوجد موظفون — أضف فريقك لاحتساب الرواتب.", "No employees — add your team to track salaries.", locale)} />} />
      </Card>

      {editing ? (
        <EmployeeModal
          key={editing === "new" ? "new" : editing.id}
          employee={editing === "new" ? null : editing}
          locale={locale}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={async (fd) => {
            setBusy(true);
            const res = editing === "new" ? await createEmployee(fd) : await updateEmployee(fd);
            setBusy(false);
            if (res.ok) { toast.success(L("تم الحفظ", "Saved", locale)); setEditing(null); router.refresh(); } else toast.error(res.error || "خطأ");
          }}
        />
      ) : null}
    </div>
  );
}

function EmployeeModal({ employee, locale, busy, onClose, onSubmit }: { employee: Employee | null; locale: Locale; busy: boolean; onClose: () => void; onSubmit: (fd: FormData) => void }) {
  const submit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); };
  return (
    <Modal open onClose={onClose} title={employee ? L("تعديل موظف", "Edit Employee", locale) : L("موظف جديد", "New Employee", locale)}>
      <form onSubmit={submit}>
        {employee ? <input type="hidden" name="id" defaultValue={employee.id} /> : null}
        <Field label={L("الاسم", "Name", locale)}><Input name="name" defaultValue={employee?.name} required /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label={L("الدور", "Role", locale)}><Input name="role" defaultValue={employee?.role ?? ""} placeholder={L("مثال: مصور", "e.g. Cinematographer", locale)} /></Field>
          <Field label={L("الراتب الشهري (د.ل)", "Monthly Salary (LYD)", locale)}><Input name="monthlySalary" inputMode="decimal" defaultValue={employee?.monthlySalary ?? ""} required /></Field>
        </div>
        {employee ? (
          <Field label={L("الحالة", "Status", locale)}>
            <Select name="active" defaultValue={employee.active ? "true" : "false"}>
              <option value="true">{L("نشط", "Active", locale)}</option>
              <option value="false">{L("غير نشط", "Inactive", locale)}</option>
            </Select>
          </Field>
        ) : (
          <Field label={L("تاريخ البدء (اختياري)", "Start date (optional)", locale)}><Input type="date" name="startDate" /></Field>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <Button type="button" variant="ghost" onClick={onClose}>{L("إلغاء", "Cancel", locale)}</Button>
          <Button type="submit" loading={busy}>{L("حفظ", "Save", locale)}</Button>
        </div>
      </form>
    </Modal>
  );
}
