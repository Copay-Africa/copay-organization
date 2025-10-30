import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    // Try to read the copay_org_token cookie
    let token: string | undefined = undefined;
    try {
      // In middleware, cookies are available via req.cookies
      const c = req.cookies.get("copay_org_token");
      if (c) token = typeof c === "string" ? c : c.value;
    } catch {
      // fallback: read raw cookie header
      const raw = req.headers.get("cookie") || "";
      const match = raw.match(/(?:^|; )copay_org_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
