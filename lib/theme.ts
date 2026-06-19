import { cookies } from "next/headers";

export type ThemePref = "light" | "dark" | "system";
export const THEME_COOKIE = "fennec_theme";
const DEFAULT_PREF: ThemePref = "light"; // default to light mode

/** Read the saved theme preference from the cookie (server). */
export async function getThemePref(): Promise<ThemePref> {
  const c = await cookies();
  const v = c.get(THEME_COOKIE)?.value;
  return v === "light" || v === "dark" || v === "system" ? v : DEFAULT_PREF;
}

/** The data-theme attribute to render server-side. For "system" we fall back
 *  to dark on the server; the pre-paint script corrects it before first paint. */
export function resolveThemeAttr(pref: ThemePref): "light" | "dark" {
  // light + system default to light on the server; the pre-paint script
  // corrects "system" to the OS preference before first paint.
  return pref === "dark" ? "dark" : "light";
}
