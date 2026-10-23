"use client";

import { useRef, useState, type FormEvent } from "react";
import type { ScheduleNote } from "@/types/schedule";

export type NoteInput = Pick<ScheduleNote, "content" | "author">;

interface ScheduleNotesProps {
  notes: ScheduleNote[];
  onAdd: (note: NoteInput) => Promise<boolean>;
  onDelete: (noteId: string) => Promise<void>;
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ScheduleNotes({ notes, onAdd, onDelete }: ScheduleNotesProps) {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  // Guards against a second click landing before the disabled state re-renders
  const deletingRef = useRef<Set<string>>(new Set());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const ok = await onAdd({ content: content.trim(), author: author.trim() || null });
      if (ok) setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (deletingRef.current.has(noteId)) return;

    deletingRef.current.add(noteId);
    setDeletingIds((prev) => new Set(prev).add(noteId));
    try {
      await onDelete(noteId);
    } finally {
      deletingRef.current.delete(noteId);
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    }
  };

  return (
    <div className="mt-3 border-t border-black/10 dark:border-white/10 pt-3 flex flex-col gap-2">
      <h4 className="text-xs font-medium text-black/50 dark:text-white/50">
        메모 {notes.length > 0 && `(${notes.length})`}
      </h4>

      {notes.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group flex items-start justify-between gap-3 rounded-md bg-black/[0.03] dark:bg-white/5 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="whitespace-pre-wrap break-words">{note.content}</p>
                <p className="mt-0.5 text-xs text-black/40 dark:text-white/40">
                  {note.author && `${note.author} · `}
                  {formatDateTime(note.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                disabled={deletingIds.has(note.id)}
                aria-label="메모 삭제"
                className="shrink-0 text-xs text-black/40 hover:text-red-600 dark:text-white/40 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="작성자 (선택)"
          aria-label="작성자"
          className="sm:w-28 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메모를 입력하세요"
          aria-label="메모 내용"
          className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          추가
        </button>
      </form>
    </div>
  );
}
