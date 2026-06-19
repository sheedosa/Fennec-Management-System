"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CapitalAsset, AssetType, Locale, OrgRole } from "@/lib/types";
import { L, fmtDate } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Table, type Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toaster";
import { createAsset, updateAsset, deleteAsset } from "@/actions/capital";

const TYPE_LABEL: Record<AssetType, [string, string]> = {
  cash: ["نقد", "Cash"],
  equipment: ["معدات", "Equipment"],
  investment: ["استثمار", "Investment"],
  receivable: ["مستحقات", "Receivable"],
  other: ["أخرى", "Other"],
};

export function CapitalManager({ assets, locale, role }: { assets: CapitalAsset[]; locale: Locale; role: OrgRole }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CapitalAsset | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  async function onDelete(a: CapitalAsset) {
    if (!confirm(L("حذف هذا الأصل؟", "Delete this asset?", locale))) return;
    const res = await deleteAsset(a.id);
    if (res.ok) { toast.success(L("تم الحذف", "Deleted", locale)); router.refresh(); }
    else toast.error(res.error || "خطأ");
  }

  const columns: Column<CapitalAsset>[] = [
    { key: "name", header: L("الأصل", "Asset", locale), render: (a) => <span style={{ fontWeight: 700 }}>{a.name}</span> },
    { key: "type", header: L("النوع", "Type", locale), render: (a) => <Badge tone="outline">{L(TYPE_LABEL[a.type][0], TYPE_LABEL[a.type][1], locale)}</Badge> },
    { key: "value", header: L("القيمة", "Value", locale), align: "end", render: (a) => <span className="fx-num" style={{ fontWeight: 700 }}>{money(a.value, locale)}</span> },
    { key: "acquired", header: L("تاريخ الاقتناء", "Acquired", locale), render: (a) => (a.acquiredOn ? fmtDate(a.acquiredOn, locale) : "—") },
    {
      key: "actions", header: "", align: "end",
      render: (a) => (
        <div style={{ display: "inline-flex", gap: "6px" }}>
          <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>{L("تعديل", "Edit", locale)}</Button>
          {role === "manager" ? <Button size="sm" variant="danger" onClick={() => onDelete(a)}>{L("حذف", "Delete", locale)}</Button> : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 14px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--fg)" }}>{L("سجل الأصول", "Asset Register", locale)}</h2>
        <Button onClick={() => setEditing("new")}>{L("+ إضافة أصل", "+ Add Asset", locale)}</Button>
      </div>
      <Card style={{ overflow: "hidden" }}>
        <Table columns={columns} rows={assets} rowKey={(a) => a.id} empty={<EmptyState message={L("لا توجد أصول بعد — أضف نقد الشركة ومعداتها واستثماراتها.", "No assets yet — add the company's cash, equipment and investments.", locale)} />} />
      </Card>

      {editing ? (
        <AssetModal
          key={editing === "new" ? "new" : editing.id}
          asset={editing === "new" ? null : editing}
          locale={locale}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={async (fd) => {
            setBusy(true);
            const res = editing === "new" ? await createAsset(fd) : await updateAsset(fd);
            setBusy(false);
            if (res.ok) { toast.success(L("تم الحفظ", "Saved", locale)); setEditing(null); router.refresh(); }
            else toast.error(res.error || "خطأ");
          }}
        />
      ) : null}
    </>
  );
}

function AssetModal({ asset, locale, busy, onClose, onSubmit }: { asset: CapitalAsset | null; locale: Locale; busy: boolean; onClose: () => void; onSubmit: (fd: FormData) => void }) {
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };
  return (
    <Modal open onClose={onClose} title={asset ? L("تعديل أصل", "Edit Asset", locale) : L("أصل جديد", "New Asset", locale)}>
      <form onSubmit={submit}>
        {asset ? <input type="hidden" name="id" defaultValue={asset.id} /> : null}
        <Field label={L("اسم الأصل", "Asset name", locale)}>
          <Input name="name" defaultValue={asset?.name} required placeholder={L("مثال: كاميرا RED", "e.g. RED camera", locale)} />
        </Field>
        <div className="fx-2col">
          <Field label={L("النوع", "Type", locale)}>
            <Select name="type" defaultValue={asset?.type ?? "cash"}>
              {(Object.keys(TYPE_LABEL) as AssetType[]).map((t) => <option key={t} value={t}>{L(TYPE_LABEL[t][0], TYPE_LABEL[t][1], locale)}</option>)}
            </Select>
          </Field>
          <Field label={L("القيمة (د.ل)", "Value (LYD)", locale)}>
            <Input name="value" inputMode="decimal" defaultValue={asset?.value ?? ""} required placeholder="0" />
          </Field>
        </div>
        <Field label={L("تاريخ الاقتناء (اختياري)", "Acquired on (optional)", locale)}>
          <Input type="date" name="acquiredOn" defaultValue={asset?.acquiredOn ?? ""} />
        </Field>
        <Field label={L("ملاحظات", "Notes", locale)}>
          <Textarea name="notes" defaultValue={asset?.notes ?? ""} />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <Button type="button" variant="ghost" onClick={onClose}>{L("إلغاء", "Cancel", locale)}</Button>
          <Button type="submit" loading={busy}>{L("حفظ", "Save", locale)}</Button>
        </div>
      </form>
    </Modal>
  );
}
