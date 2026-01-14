import { NextResponse } from "next/server";
import { getTodoById, updateTodo, deleteTodo } from "@/lib/todo.repo";

/* =========================
   PUT /api/todos/:id
   Update ทั้ง record: title + done
========================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // Validate ทั้งสอง field ต้องมี
    if (typeof body.title !== "string" || typeof body.done !== "boolean") {
      return NextResponse.json(
        { error: "title (string) and done (boolean) are required" },
        { status: 400 }
      );
    }

    const existing = await getTodoById(id);
    if (!existing) return NextResponse.json({ error: "todo not found" }, { status: 404 });

    await updateTodo(id, { title: body.title, done: body.done });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "failed to update todo" }, { status: 500 });
  }
}

/* =========================
   PATCH /api/todos/:id
   Update เฉพาะ field ที่ส่งมา (partial update)
========================= */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const existing = await getTodoById(id);
    if (!existing) return NextResponse.json({ error: "todo not found" }, { status: 404 });

    // ส่งเฉพาะ field ที่ถูกต้อง
    const data: { title?: string; done?: boolean } = {};
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.done === "boolean") data.done = body.done;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "nothing to update" }, { status: 400 });
    }

    await updateTodo(id, data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "failed to patch todo" }, { status: 500 });
  }
}

/* =========================
   DELETE /api/todos/:id
========================= */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const existing = await getTodoById(id);
    if (!existing) return NextResponse.json({ error: "todo not found" }, { status: 404 });

    await deleteTodo(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "failed to delete todo" }, { status: 500 });
  }
}
