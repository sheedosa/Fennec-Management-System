"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/types";
import { L } from "@/lib/i18n/dictionary";
import { toast } from "@/components/ui/Toaster";
import { getUpcomingReminders } from "@/actions/reminders";

// Polls upcoming events and fires in-app + browser reminders at
// (starts_at − remind_minutes_before). De-dupes via localStorage. No email.
export function ReminderProvider({ locale }: { locale: Locale }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window && Notification.permission === "default") {
      // Request once; if denied, reminders still show as in-app toasts.
      Notification.requestPermission().catch(() => {});
    }

    let stopped = false;
    const fire = (id: string, startsAt: string, title: string) => {
      const key = `fennec_reminded_${id}_${startsAt}`;
      try {
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, "1");
      } catch {}
      const msg = L("تذكير: ", "Reminder: ", locale) + title;
      toast.info(msg);
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Fennec", { body: title });
        }
      } catch {}
    };

    const check = async () => {
      try {
        const reminders = await getUpcomingReminders();
        if (stopped) return;
        const now = Date.now();
        for (const r of reminders) {
          const fireAt = new Date(r.startsAt).getTime() - r.remind * 60_000;
          if (now >= fireAt && now < new Date(r.startsAt).getTime()) fire(r.id, r.startsAt, r.title);
        }
      } catch {}
    };

    check();
    const t = setInterval(check, 60_000);
    return () => { stopped = true; clearInterval(t); };
  }, [locale]);

  return null;
}
