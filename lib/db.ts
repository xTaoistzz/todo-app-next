import mariadb, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Pool as PostgresPool, QueryResultRow } from "pg";
import { MongoClient, Collection, Document } from "mongodb";

const DB_TYPE = process.env.DB_TYPE;

// ---------- Pools ----------
let mariadbPool: mariadb.Pool | null = null;
let pgPool: PostgresPool | null = null;
let mongoClient: MongoClient | null = null;

// กัน log ซ้ำตอน hot reload
let hasLoggedStartup = false;

// ---------- Utils ----------
function logDb(message: string, type: "info" | "ok" | "error" = "info") {
  const color =
    type === "ok" ? "\x1b[32m" : type === "error" ? "\x1b[31m" : "\x1b[36m";
  console.log(`${color}[DB]\x1b[0m ${message}`);
}

// ---------- Init ----------
export async function initDb() {
  try {
    if (DB_TYPE === "mariadb") {
      if (!mariadbPool) {
        mariadbPool = mariadb.createPool({
          host: process.env.MARIADB_HOST,
          user: process.env.MARIADB_USER,
          password: process.env.MARIADB_PASSWORD,
          database: process.env.MARIADB_DATABASE,
          connectionLimit: 10,
        });

        if (!hasLoggedStartup) {
          logDb(
            `MariaDB → ${process.env.MARIADB_USER}@${process.env.MARIADB_HOST}/${process.env.MARIADB_DATABASE}`
          );
        }
      }
    }

    else if (DB_TYPE === "postgres") {
      if (!pgPool) {
        pgPool = new PostgresPool({
          host: process.env.POSTGRES_HOST,
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DATABASE,
          port: Number(process.env.POSTGRES_PORT) || 5432,
        });

        if (!hasLoggedStartup) {
          logDb(
            `Postgres → ${process.env.POSTGRES_USER}@${process.env.POSTGRES_HOST}/${process.env.POSTGRES_DATABASE}`
          );
        }
      }
    }

    else if (DB_TYPE === "mongo") {
      if (!mongoClient) {
        mongoClient = new MongoClient(
          `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`
        );
        await mongoClient.connect();

        if (!hasLoggedStartup) {
          logDb(
            `MongoDB → ${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}`
          );
        }
      }
    }

    else {
      throw new Error("Invalid DB_TYPE");
    }

    // ---------- Ping ----------
    if (!hasLoggedStartup) {
      await dbPing();
      logDb(`Connected (${DB_TYPE})`, "ok");
      hasLoggedStartup = true;
    }
  } catch (err: any) {
    logDb(`Connection failed (${DB_TYPE})`, "error");
    logDb(err.message, "error");
    throw err;
  }
}

// ---------- Query ----------
export async function query(
  sql: string,
  params: any[] = []
): Promise<any[]> {  // เอา generic T ออก
  if (DB_TYPE === "mariadb") {
    if (!mariadbPool) await initDb();
    const [rows] = await mariadbPool!.query<RowDataPacket[] | ResultSetHeader[]>(sql, params);
    return rows as any[];
  }

  if (DB_TYPE === "postgres") {
    if (!pgPool) await initDb();
    const res = await pgPool!.query(sql, params);  // ลบ <T>
    return res.rows; // SELECT/RETURNING จะมี rows, UPDATE/DELETE ไม่มี rows → empty array ก็ได้
  }

  throw new Error("Use mongoCollection for MongoDB");
}


// ---------- Mongo ----------
export async function mongoCollection<T extends Document = Document>(
  name: string
): Promise<Collection<T>> {
  if (!mongoClient) await initDb();
  return mongoClient!.db(process.env.MONGO_DATABASE).collection<T>(name);
}

// ---------- Ping ----------
async function dbPing() {
  if (DB_TYPE === "mariadb") {
    const conn = await mariadbPool!.getConnection();
    await conn.ping();
    conn.release();
  }

  if (DB_TYPE === "postgres") {
    await pgPool!.query("SELECT 1");
  }

  if (DB_TYPE === "mongo") {
    await mongoClient!.db().command({ ping: 1 });
  }
}

// ---------- Status ----------
export async function dbStatus() {
  try {
    await dbPing();
    return { status: "connected", database: DB_TYPE };
  } catch {
    return { status: "disconnected", database: DB_TYPE };
  }
}
