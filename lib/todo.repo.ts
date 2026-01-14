import { query, mongoCollection } from "./db";
import { ObjectId } from "mongodb";

const DB_TYPE = process.env.DB_TYPE;

/* =========================
   GET todos
========================= */
export async function getTodos() {
  if (DB_TYPE === "mongo") {
    const col = await mongoCollection("todos");
    return col.find({}).toArray();
  }

  if (DB_TYPE === "postgres") {
    return query("SELECT id, title, done FROM todos ORDER BY id DESC", []);
  }

  // mariadb
  return query("SELECT id, title, done FROM todos ORDER BY id DESC", []);
}

/* =========================
   GET todo by id
========================= */
export async function getTodoById(id: string) {
  if (DB_TYPE === "mongo") {
    const col = await mongoCollection("todos");
    return col.findOne({ _id: new ObjectId(id) });
  }

  if (DB_TYPE === "postgres") {
    const rows = await query("SELECT id, title, done FROM todos WHERE id = $1", [id]);
    return rows[0] ?? null;
  }

  // mariadb
  const rows = await query("SELECT id, title, done FROM todos WHERE id = ?", [id]);
  return rows[0] ?? null;
}

/* =========================
   CREATE todo
========================= */
export async function createTodo(title: string) {
  if (DB_TYPE === "mongo") {
    const col = await mongoCollection("todos");
    const res = await col.insertOne({ title, done: false, createdAt: new Date() });
    return { id: res.insertedId, title, done: false };
  }

  if (DB_TYPE === "postgres") {
    const rows = await query(
      "INSERT INTO todos (title, done) VALUES ($1, false) RETURNING id, title, done",
      [title]
    );
    return rows[0];
  }

  // mariadb
  const result: any = await query("INSERT INTO todos (title, done) VALUES (?, ?)", [
    title,
    false,
  ]);
  return { id: result.insertId, title, done: false };
}

/* =========================
   UPDATE todo
========================= */
export async function updateTodo(
  id: string,
  data: { title?: string; done?: boolean }
) {
  if (Object.keys(data).length === 0) return;

  if (DB_TYPE === "mongo") {
    const col = await mongoCollection("todos");
    const setData: any = {};
    if (data.title !== undefined) setData.title = data.title;
    if (data.done !== undefined) setData.done = data.done;
    await col.updateOne({ _id: new ObjectId(id) }, { $set: setData });
    return;
  }

  if (DB_TYPE === "postgres") {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.done !== undefined) {
      fields.push(`done = $${idx++}`);
      values.push(data.done);
    }

    values.push(id);
    const sql = `UPDATE todos SET ${fields.join(", ")} WHERE id = $${idx}`;
    await query(sql, values);
    return;
  }

  // mariadb
  const sets: string[] = [];
  const vals: any[] = [];
  if (data.title !== undefined) {
    sets.push("title = ?");
    vals.push(data.title);
  }
  if (data.done !== undefined) {
    sets.push("done = ?");
    vals.push(data.done);
  }

  vals.push(id);
  const sql = `UPDATE todos SET ${sets.join(", ")} WHERE id = ?`;
  await query(sql, vals);
}

/* =========================
   DELETE todo
========================= */
export async function deleteTodo(id: string) {
  if (DB_TYPE === "mongo") {
    const col = await mongoCollection("todos");
    await col.deleteOne({ _id: new ObjectId(id) });
    return;
  }

  if (DB_TYPE === "postgres") {
    await query("DELETE FROM todos WHERE id = $1", [id]);
    return;
  }

  // mariadb
  await query("DELETE FROM todos WHERE id = ?", [id]);
}
