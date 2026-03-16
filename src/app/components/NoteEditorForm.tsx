"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useState } from "react";

const EMPTY_DOCUMENT = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

type NoteEditorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  noteId?: string;
  initialTitle?: string;
  initialContentJson?: string;
};

function toInitialDocument(input?: string): Record<string, unknown> {
  if (!input) {
    return EMPTY_DOCUMENT;
  }

  try {
    const parsed = JSON.parse(input) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Keep fallback document for invalid legacy content.
  }

  return EMPTY_DOCUMENT;
}

export function NoteEditorForm({
  action,
  submitLabel,
  noteId,
  initialTitle = "",
  initialContentJson,
}: NoteEditorFormProps) {
  const initialDocument = useMemo(
    () => toInitialDocument(initialContentJson),
    [initialContentJson]
  );
  const [contentJson, setContentJson] = useState(() =>
    JSON.stringify(initialDocument)
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialDocument,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      setContentJson(JSON.stringify(currentEditor.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    setContentJson(JSON.stringify(editor.getJSON()));
  }, [editor]);

  useEffect(() => {
    if (!editor || noteId) {
      return;
    }

    editor.commands.focus("end");
  }, [editor, noteId]);

  return (
    <form action={action}>
      {noteId ? <input type="hidden" name="noteId" value={noteId} /> : null}

      <label htmlFor="title">Title</label>
      <input id="title" name="title" type="text" defaultValue={initialTitle} required />

      <input type="hidden" name="contentJson" value={contentJson} readOnly />

      <label htmlFor="editor">Content</label>
      <div className="tn-editor-toolbar" role="toolbar" aria-label="Editor toolbar">
        <button
          type="button"
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-pressed={editor?.isActive("bold") ?? false}
        >
          Bold
        </button>
        <button
          type="button"
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          aria-pressed={editor?.isActive("italic") ?? false}
        >
          Italic
        </button>
        <button
          type="button"
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          aria-pressed={editor?.isActive("bulletList") ?? false}
        >
          Bullet List
        </button>
      </div>
      <div id="editor" className="tn-editor">
        <EditorContent editor={editor} />
      </div>

      <button type="submit">{submitLabel}</button>
    </form>
  );
}
