"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Todo = {
  id: string; // unified for all DB
  title: string;
  done: boolean;
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadTodos = async () => {
    const res = await fetch(`/api/todos`);
    const data = await res.json();

    // normalize id (_id -> id for Mongo)
    const normalized: Todo[] = data.map((t: any) => ({
      id: t.id?.toString() || t._id?.toString(),
      title: t.title,
      done: t.done,
    }));

    setTodos(normalized);
  };

  const addTodo = async () => {
    if (!newTitle.trim()) return;
    await fetch(`/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    setNewTitle("");
    loadTodos();
  };

  const toggleDone = async (todo: Todo) => {
    await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    loadTodos();
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const saveEdit = async (id: string, done: boolean) => {
    if (!editingTitle.trim()) return;
    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle }),
    });
    setEditingId(null);
    setEditingTitle("");
    loadTodos();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    loadTodos();
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") action();
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const completedCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 flex flex-col items-center font-sans">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Home</span>
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Todo List
          </h1>
          {totalCount > 0 && (
            <p className="text-slate-600 text-sm">
              {completedCount} of {totalCount} tasks completed
              {completedCount === totalCount && totalCount > 0 && " 🎉"}
            </p>
          )}
        </div>
      </div>

      {/* Add Todo */}
      <div className="flex w-full max-w-2xl gap-3 mb-8">
        <input
          className="flex-1 px-5 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-800 placeholder-slate-400"
          placeholder="Add new task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, addTodo)}
        />
        <button
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={addTodo}
        >
          Add
        </button>
      </div>

      {/* Todo List */}
      <ul className="w-full max-w-2xl space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-slate-500 text-lg">No tasks yet. Add one to get started!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <li
              key={todo.id} // ✅ fix unique key
              className="flex items-center justify-between bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-slate-100"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Checkbox */}
                <button onClick={() => toggleDone(todo)} className="flex-shrink-0 group">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      todo.done
                        ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-500 shadow-lg shadow-green-200"
                        : "border-slate-300 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    {todo.done && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Content */}
                {editingId === todo.id ? (
                  <input
                    className="flex-1 px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 bg-blue-50 transition-all duration-200"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, () => saveEdit(todo.id, todo.done))}
                    autoFocus
                  />
                ) : (
                  <span
                    className={`flex-1 text-base transition-all duration-300 ${
                      todo.done ? "line-through text-slate-400" : "text-slate-800 font-medium"
                    }`}
                  >
                    {todo.title}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                {editingId === todo.id ? (
                  <>
                    <button
                      className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200"
                      onClick={() => saveEdit(todo.id, todo.done)}
                    >
                      Save
                    </button>
                    <button
                      className="px-4 py-2 bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-200"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="px-4 py-2 text-blue-600 bg-blue-50 text-sm font-semibold rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      onClick={() => startEdit(todo)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 text-red-600 bg-red-50 text-sm font-semibold rounded-lg hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-200"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
