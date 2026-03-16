type DeleteNoteButtonProps = {
  noteId: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function DeleteNoteButton({ noteId, action }: DeleteNoteButtonProps) {
  return (
    <section>
      <h2>Delete</h2>
      <form action={action}>
        <input type="hidden" name="noteId" value={noteId} />
        <button type="submit">Delete Note</button>
      </form>
    </section>
  );
}
