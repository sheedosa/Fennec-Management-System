import { createClient } from "@/lib/supabase/server";
import { curYM } from "@/lib/finance/period";
import type { Employee } from "@/lib/types";

export interface EmployeesView {
  employees: Employee[];
  currentYM: string;
  pending: number; // active employees not yet logged this month
  monthlyTotal: number; // sum of active salaries
}

export async function loadEmployees(): Promise<EmployeesView> {
  const supabase = await createClient();
  const { data } = await supabase.from("employees").select("*").is("deleted_at", null).order("created_on", { ascending: true });
  const employees: Employee[] = (data ?? []).map((e) => ({
    id: e.id, name: e.name, role: e.role, monthlySalary: Number(e.monthly_salary), active: e.active,
    startDate: e.start_date, lastSalaryYM: e.last_salary_ym, date: e.created_on,
  }));
  const ym = curYM(new Date());
  const active = employees.filter((e) => e.active);
  return {
    employees,
    currentYM: ym,
    pending: active.filter((e) => e.lastSalaryYM !== ym).length,
    monthlyTotal: active.reduce((s, e) => s + e.monthlySalary, 0),
  };
}
