// app/api/status/route.ts
import { NextResponse } from "next/server";
import { initDb, mongoCollection, query } from "@/lib/db";

export async function GET() {
  const dbType = process.env.DB_TYPE;

  try {
    if (!dbType) {
      throw new Error("DB_TYPE is not set");
    }

    await initDb();

    if (dbType === "mongo") {
      const col = await mongoCollection("todos");
      await col.estimatedDocumentCount();
    } else {
      await query("SELECT 1");
    }

    return NextResponse.json({
      status: "connected",
      database: dbType,
    });
  } catch (err) {
    console.error("[DB STATUS]", err);

    return NextResponse.json(
      {
        status: "disconnected",
        database: dbType ?? "unknown",
      },
      { status: 500 }
    );
  }
}
