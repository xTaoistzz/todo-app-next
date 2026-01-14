// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const visitCounter = new Map<string, number>();
const ipFirstSeen = new Map<string, Date>();

export function middleware(request: NextRequest) {
  // รับ IP จริงจาก header ของ Nginx
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"; // fallback เป็น unknown แทน request.ip

  const path = request.nextUrl.pathname;
  const method = request.method;
  const now = new Date();

  const time = now.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const userAgent = request.headers.get("user-agent") || "unknown";
  const browser =
    userAgent.includes("Edg/") || userAgent.includes("Edge/")
      ? "🔷 Edge"
      : userAgent.includes("Chrome")
      ? "🌐 Chrome"
      : userAgent.includes("Firefox")
      ? "🦊 Firefox"
      : userAgent.includes("Safari") && !userAgent.includes("Chrome")
      ? "🧭 Safari"
      : "💻 Browser";

  const action =
    method === "GET"
      ? "📥 READ"
      : method === "POST"
      ? "➕ CREATE"
      : method === "PUT" || method === "PATCH"
      ? "✏️ UPDATE"
      : method === "DELETE"
      ? "🗑 DELETE"
      : "⚙️ ACTION";

  const shouldLog =
    !path.startsWith("/_next") &&
    !path.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/);

  if (shouldLog) {
    if (!ipFirstSeen.has(ip)) ipFirstSeen.set(ip, now);

    const key = `${ip}:${path}`;
    const currentCount = (visitCounter.get(key) || 0) + 1;
    visitCounter.set(key, currentCount);

    let totalVisits = 0;
    visitCounter.forEach((count, counterKey) => {
      if (counterKey.startsWith(`${ip}:`)) totalVisits += count;
    });

    const visitorBadge = totalVisits === 1 ? "🆕 NEW" : "👤 RETURNING";

    console.log(
      `\x1b[36m[ACCESS]\x1b[0m [${time}] ${visitorBadge} | ${action} | ${method} ${path} | IP: ${ip} | ${browser} | ${currentCount}x page, ${totalVisits}x total`
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)"],
};
