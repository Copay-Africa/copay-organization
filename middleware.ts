import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple JWT validation without external dependencies
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    // Check expiration
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    let token: string | undefined = undefined;

    try {
      const c = req.cookies.get("copay_org_token");
      if (c) token = typeof c === "string" ? c : c.value;
    } catch {
      // fallback: read raw cookie header
      const raw = req.headers.get("cookie") || "";
      const match = raw.match(/(?:^|; )copay_org_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token || !isTokenValid(token)) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Prevent authenticated users from accessing login page
  if (pathname === "/login") {
    const token = req.cookies.get("copay_org_token")?.value;
    if (token && isTokenValid(token)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Add security headers
  const response = NextResponse.next();

  // Security headers for production
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
