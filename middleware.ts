import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (e) {
    // Never let a middleware throw hard-500 the whole site
    // (MIDDLEWARE_INVOCATION_FAILED). The (app) layout still enforces auth
    // server-side via getOrgContext, so failing open here is not a bypass.
    console.error("[middleware] error:", e);
    return NextResponse.next({ request });
  }
}

export const config = {
  // Run on all paths except static assets and image optimization.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
