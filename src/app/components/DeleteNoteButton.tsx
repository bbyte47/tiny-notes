"use client";

import { useRef } from "react";

type DeleteNoteButtonProps = {
  noteId: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function DeleteNoteButton({ noteId, action }: DeleteNoteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  function openModal() {
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  return (
    <section>
      <h2>Delete</h2>
      <button type="button" className="danger-button" onClick={openModal}>
        Delete Note
      </button>
      <dialog
        ref={dialogRef}
        className="confirm-dialog"
        aria-labelledby="delete-note-title"
      >
        <div className="confirm-dialog-content">
          <h3 id="delete-note-title">Delete this note?</h3>
          <p>This action cannot be undone.</p>
          <div className="confirm-dialog-actions">
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
            <form action={action}>
              <input type="hidden" name="noteId" value={noteId} />
              <button type="submit" className="danger-button">
                Confirm Delete
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </section>
  );
}
