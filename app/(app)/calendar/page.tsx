import { getOrgContext } from "@/lib/auth/context";
import { loadCalendar } from "@/lib/data/calendar";
import { L } from "@/lib/i18n/dictionary";
import { SectionHead } from "@/components/ui/Card";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function CalendarPage() {
  const ctx = (await getOrgContext())!;
  const { events, projects, clients } = await loadCalendar();
  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead
        title={L("التقويم", "Calendar", ctx.locale)}
        sub={L("جلسات التصوير والاجتماعات والمواعيد — مع تذكيرات.", "Shoots, meetings and deadlines — with reminders.", ctx.locale)}
      />
      <CalendarView events={events} projects={projects} clients={clients} locale={ctx.locale} />
    </div>
  );
}
