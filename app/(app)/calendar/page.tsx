import { getOrgContext } from "@/lib/auth/context";
import { L } from "@/lib/i18n/dictionary";
import { SectionHead, Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

// Placeholder — fleshed out in M8 (month + agenda + reminders).
export default async function CalendarPage() {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead title={L("التقويم", "Calendar", locale)} sub={L("الجلسات والمواعيد القادمة.", "Upcoming sessions and bookings.", locale)} />
      <Card style={{ padding: "8px" }}>
        <EmptyState message={L("قيد الإنشاء — تقويم تفاعلي وتذكيرات قادمة قريباً.", "Coming soon — interactive calendar and reminders.", locale)} />
      </Card>
    </div>
  );
}
