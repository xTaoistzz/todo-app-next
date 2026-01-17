// app/page.tsx
import Link from "next/link";
import { headers } from "next/headers";

// const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/app1";

async function getStatus() {
  try {
    const h = await headers();

    const host = h.get("host"); // เช่น localhost
    const proto = h.get("x-forwarded-proto") ?? "http";

    const url = `http://localhost:3000/api/status`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) return { status: "unknown" };
    return res.json();
  } catch {
    return { status: "disconnected" };
  }
}

export default async function Home() {
  const status = await getStatus();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-gray-900">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Todo List
            </h1>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-20 flex flex-col items-center gap-8 text-center">

        <h2 className="text-4xl font-bold text-slate-900">
          Manage Your Tasks
        </h2>

        <p className="text-slate-600 text-lg max-w-md leading-relaxed">
          A simple todo list for tracking your daily tasks
        </p>

        {/* Database Status */}
        <div className="flex flex-col items-center gap-1 px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                status.status === "connected"
                  ? "bg-emerald-500 animate-pulse shadow-emerald-500/50"
                  : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium text-slate-700">
              Database status
            </span>
          </div>

          <div className="text-sm">
            {status.status === "connected" ? (
              <span className="text-emerald-600 font-semibold">
                Connected to {status.database}
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                Database disconnected
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={`/todos`}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <span>Go to Todo List</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </Link>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm w-full border-t border-slate-200 text-center py-5 text-slate-600 text-sm">
        Built with Next.js
      </footer>
    </div>
  );
}
