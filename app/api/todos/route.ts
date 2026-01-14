import { NextResponse } from "next/server";
import { getTodos, createTodo } from "@/lib/todo.repo";

export async function GET() {
  try {
    const todos = await getTodos();
    return NextResponse.json(todos);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    const todo = await createTodo(body.title);
    return NextResponse.json(todo, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "failed to create todo" },
      { status: 500 }
    );
  }
}
