import { NextResponse, type NextRequest } from "next/server";

interface TokenPayload {
  sub?: string;
  mosqueId?: string | null;
  role?: string | null;
  sessionVersion?: number;
  mustChangePassword?: boolean;
  exp?: number;
}

function parseJwtPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const jsonStr = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("access_token")?.value ||
    request.cookies.get("token")?.value;

  const payload = token ? parseJwtPayload(token) : null;
  const isExpired = payload?.exp ? payload.exp * 1000 < Date.now() : false;
  const isAuthenticated = Boolean(payload && !isExpired);

  // 1. Unauthenticated requests -> redirect to /login
  if (!isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const redirectTarget = pathname + search;
    loginUrl.search = `redirect=${encodeURIComponent(redirectTarget || "/")}`;
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users who must change password -> redirect to /change-password
  if (payload?.mustChangePassword) {
    if (!pathname.startsWith("/change-password")) {
      const changePasswordUrl = request.nextUrl.clone();
      changePasswordUrl.pathname = "/change-password";
      changePasswordUrl.search = "";
      return NextResponse.redirect(changePasswordUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/mosques", "/mosques/:path*", "/change-password"],
};

