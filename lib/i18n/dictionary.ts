import type { Locale } from "@/lib/types";

// Ported verbatim from prototype `DICT` (Arabic source → English). The app
// is Arabic-first: Arabic strings are the canonical keys. `tr()` mirrors the
// prototype's translate, `L()` mirrors its inline ar/en pair helper.
// (Phase 3 migrates these into next-intl message catalogs; this module keeps
// the UI port faithful in the meantime and is the source for catalog gen.)

export const DICT: Record<string, string> = {
  "لوحة القيادة": "Dashboard", "العملاء": "Clients", "الفرص البيعية": "Pipeline", "المشاريع والعقود": "Projects & Contracts", "الفواتير": "Invoices", "المالية والمصروفات": "Finance & Expenses",
  "الإدارة المالية": "Financial Management", "وكالة فينيك": "Fennec Agency", "حساب المدير": "Manager Account", "تم الحفظ": "Saved", "حفظ تلقائي مفعّل": "Auto-save on",
  "نظرة عامة": "Overview", "مؤشرات الأداء المالي للوكالة": "The agency's financial performance",
  "هذا الشهر": "This Month", "هذا الربع": "This Quarter", "هذه السنة": "This Year", "كل الوقت": "All Time",
  "إجمالي الإيرادات المحصّلة": "Total Revenue Collected", "فواتير غير محصّلة": "Outstanding Invoices", "مصاريف مباشرة للمشاريع": "Direct Project Expenses", "مصاريف ثابتة (تشغيلية)": "Fixed Overhead", "صافي الربح / الخسارة": "Net Profit / Loss", "المشاريع النشطة": "Active Projects",
  "تصدير Excel/CSV": "Export Excel/CSV", "نسخة JSON": "JSON Backup", "استيراد JSON": "Import JSON",
  "الإيرادات مقابل المصروفات": "Revenue vs Expenses", "آخر 6 أشهر": "Last 6 months", "توزيع المصروفات": "Expense Breakdown", "أعلى العملاء بالإيرادات": "Top Clients by Revenue", "الإيرادات": "Revenue", "المصروفات": "Expenses", "الإجمالي": "Total",
  "لا توجد مصروفات في هذه الفترة": "No expenses in this period", "لا توجد إيرادات في هذه الفترة": "No revenue in this period",
  "العائد الصافي لكل مشروع": "Net Return per Project", "المشروع": "Project", "العميل": "Client", "النوع": "Type", "قيمة العقد": "Contract Value", "المحصّل": "Collected", "المصاريف": "Expenses", "الصافي": "Net",
  "اشتراك شهري": "Monthly Retainer", "إنتاج لمرة": "One-off", "اشتراك": "Retainer", "إنتاج": "Production", "لا توجد مشاريع": "No projects",
  "+ إضافة عميل": "+ Add Client", "القيمة الكلية": "Total Value", "المشاريع": "Projects", "لا يوجد عملاء بعد — ابدأ بإضافة أول عميل": "No clients yet — add your first client",
  "تعديل": "Edit", "القيمة الكلية للعميل": "Client Lifetime Value", "عدد المشاريع": "Projects", "عدد الفواتير": "Invoices", "معلومات الاتصال": "Contact Info", "الهاتف": "Phone", "البريد": "Email", "لا توجد ملاحظات": "No notes", "لا مشاريع": "No projects", "لا فواتير": "No invoices", "سجل المدفوعات": "Payment History", "لا مدفوعات": "No payments",
  "تواصل أولي": "Initial Contact", "تم إرسال العرض": "Proposal Sent", "تفاوض نهائي": "Final Negotiation", "خسارة": "Lost", "تتبّع الصفقات من التواصل حتى الإغلاق": "Track deals from contact to close", "+ إضافة فرصة": "+ Add Lead",
  "القيمة المرجّحة للأنبوب": "Weighted Pipeline Value", "معدّل الإغلاق (الفوز)": "Win Rate", "صفقات مكسوبة": "Deals Won", "صفقات خاسرة": "Deals Lost", "فوز ✓": "Win ✓", "فارغ": "Empty",
  "السعر": "Price", "التوقيت": "Timing", "منافس": "Competitor", "عدم رد": "No response", "أخرى": "Other",
  "+ مشروع جديد": "+ New Project", "توليد اشتراكات الشهر": "Generate Retainers", "القيمة": "Value", "البداية": "Start", "التسليم": "Delivery", "الحالة": "Status",
  "نشط": "Active", "معلّق": "On Hold", "مكتمل": "Completed", "ملغى": "Cancelled", "متأخر": "Overdue",
  "إدارة الفواتير والتحصيل": "Manage invoices & collections", "+ فاتورة جديدة": "+ New Invoice", "إجمالي المستحقات (غير محصّلة)": "Total Receivables (Outstanding)", "فواتير متأخرة": "Overdue Invoices", "إجمالي الفواتير": "Total Invoices", "⚠ فواتير متأخرة عن السداد": "⚠ Overdue Invoices", "تسجيل دفعة": "Record Payment", "دفعة": "Payment",
  "رقم الفاتورة": "Invoice #", "الإصدار": "Issued", "الاستحقاق": "Due", "مسودة": "Draft", "مُرسلة": "Sent", "مدفوعة": "Paid", "متأخرة": "Overdue", "لا توجد فواتير": "No invoices",
  "سجّل الإيرادات والتكاليف والمصروفات الثابتة": "Record revenue, costs & fixed expenses", "تسجيل دفعة مستلمة": "Record Received Payment", "إيراد مرتبط بمشروع أو فاتورة": "Revenue linked to a project or invoice", "تسجيل تكلفة مشروع": "Record Project Cost", "فريلانسرز، معدات، إنتاج": "Freelancers, equipment, production", "تسجيل مصروف ثابت": "Record Fixed Expense", "رواتب، إيجار، اشتراكات": "Salaries, rent, subscriptions",
  "المصروفات الثابتة المتكررة": "Recurring Fixed Expenses", "تُقترح شهرياً مع خطوة تأكيد": "Suggested monthly with a confirm step", "+ مصروف ثابت": "+ Fixed Expense", "سُجّل هذا الشهر": "Logged this month", "بانتظار": "Pending", "لا توجد مصروفات ثابتة": "No fixed expenses",
  "دفتر اليومية": "Journal", "بحث...": "Search...", "كل الأنواع": "All Types", "إيرادات": "Revenue", "تكاليف مشاريع": "Project Costs", "مصروفات ثابتة": "Fixed Expenses", "التاريخ": "Date", "الوصف": "Description", "المشروع/التصنيف": "Project / Category", "المبلغ": "Amount", "إيراد": "Revenue", "تكلفة مشروع": "Project Cost", "مصروف ثابت": "Fixed Expense", "لا توجد حركات مطابقة": "No matching entries",
  "رواتب": "Salaries", "إيجار": "Rent", "إنترنت واشتراكات": "Internet & Subscriptions", "تشغيل وضيافة": "Operations & Hospitality",
  "إلغاء": "Cancel", "حفظ": "Save", "تعديل عميل": "Edit Client", "عميل جديد": "New Client", "اسم العميل": "Client Name", "مثال: شركة الواحة": "e.g. Al-Waha Co.", "جهة الاتصال": "Contact Person", "البريد الإلكتروني": "Email", "ملاحظات": "Notes",
  "تعديل فرصة": "Edit Lead", "فرصة بيعية جديدة": "New Lead", "اسم الفرصة / المشروع": "Lead / Project Name", "مثال: حملة رمضان": "e.g. Ramadan Campaign", "القيمة المتوقعة (د.ل)": "Expected Value (LYD)", "المرحلة": "Stage", "اختر العميل": "Select a client",
  "تحديد كخسارة": "Mark as Lost", "يرجى تحديد سبب خسارة هذه الفرصة:": "Please select why this lead was lost:", "السبب": "Reason", "اختر السبب": "Select a reason", "تأكيد الخسارة": "Confirm Loss",
  "تحويل الفرصة إلى مشروع": "Convert Lead to Project", "🎉 تهانينا على الفوز بالصفقة! أكمل بيانات العقد لإنشاء مشروع نشط.": "🎉 Congrats on the win! Complete the contract details to create an active project.", "اسم المشروع": "Project Name", "نوع العقد": "Contract Type", "إنتاج لمرة واحدة": "One-off Production", "اشتراك شهري متجدد": "Monthly Retainer", "القيمة النهائية (د.ل)": "Final Value (LYD)", "القيمة الشهرية (د.ل)": "Monthly Value (LYD)", "تاريخ البداية": "Start Date", "تاريخ التسليم": "Delivery Date", "إنشاء المشروع": "Create Project",
  "تعديل مشروع": "Edit Project", "مشروع جديد": "New Project", "قيمة العقد (د.ل)": "Contract Value (LYD)", "توليد القيود": "Generate Entries",
  "تعديل فاتورة": "Edit Invoice", "فاتورة جديدة": "New Invoice", "المشروع (اختياري)": "Project (optional)", "بدون مشروع": "No project", "تاريخ الإصدار": "Issue Date", "تاريخ الاستحقاق": "Due Date", "بنود الفاتورة": "Line Items", "وصف البند": "Item description", "+ إضافة بند": "+ Add Item", "حفظ الفاتورة": "Save Invoice",
  "فاتورة: ": "Invoice: ", "المتبقي: ": "Remaining: ", "المبلغ المستلم (د.ل)": "Amount Received (LYD)", "تاريخ الدفع": "Payment Date",
  "تعديل إيراد": "Edit Revenue", "اختر المشروع": "Select a project", "المبلغ (د.ل)": "Amount (LYD)", "مثال: دفعة مقدمة": "e.g. Advance payment",
  "تعديل تكلفة": "Edit Cost", "مثال: مصور فيديو": "e.g. Videographer", "تعديل مصروف": "Edit Expense", "التصنيف": "Category", "اختر التصنيف": "Select a category",
  "مصروف ثابت متكرر": "Recurring Fixed Expense", "تعديل مصروف ثابت": "Edit Fixed Expense", "الاسم": "Name", "مثال: إيجار المكتب": "e.g. Office Rent", "المبلغ الشهري (د.ل)": "Monthly Amount (LYD)", "اختر": "Select",
  "تسجيل المصروفات الثابتة": "Record Fixed Expenses", "تأكيد التسجيل": "Confirm", "استيراد نسخة احتياطية": "Import Backup", "تنزيل نسخة احتياطية أولاً": "Download backup first",
  "الاسم مطلوب": "Name is required", "اسم الفرصة مطلوب": "Lead name is required", "قيمة غير صالحة": "Invalid amount", "مطلوب": "Required", "التاريخ مطلوب": "Date is required", "رقم الفاتورة مطلوب": "Invoice number is required", "أضف بنداً واحداً على الأقل بقيمة صحيحة": "Add at least one valid line item", "اسم المشروع مطلوب": "Project name is required",
  "الفرصة": "Lead", "الفاتورة": "Invoice", "الحركة": "Entry", "المصروف الثابت": "Fixed Expense",
};

export const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
export const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Translate an Arabic source string for the given locale (prototype `tr`). */
export function tr(s: string, lang: Locale): string {
  return lang === "en" ? (DICT[s] !== undefined ? DICT[s] : s) : s;
}

/** Inline ar/en pair (prototype `L`). */
export function L(ar: string, en: string, lang: Locale): string {
  return lang === "en" ? en : ar;
}

/** Localized month names. */
export function months(lang: Locale): string[] {
  return lang === "en" ? EN_MONTHS : AR_MONTHS;
}

/** Date formatter matching prototype `fmtDate`: "14 يونيو 2026" / "14 Jun 2026". */
export function fmtDate(s: string | undefined, lang: Locale): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(+d)) return s;
  return d.getDate() + " " + months(lang)[d.getMonth()] + " " + d.getFullYear();
}
