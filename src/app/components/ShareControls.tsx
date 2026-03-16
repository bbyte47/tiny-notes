import Link from "next/link";

type ShareControlsProps = {
  noteId: string;
  isShared: boolean;
  shareToken: string | null;
  enableAction: (formData: FormData) => void | Promise<void>;
  disableAction: (formData: FormData) => void | Promise<void>;
};

export function ShareControls({
  noteId,
  isShared,
  shareToken,
  enableAction,
  disableAction,
}: ShareControlsProps) {
  return (
    <section>
      <h2>Sharing</h2>
      {isShared && shareToken ? (
        <p>
          Public link: <Link href={`/s/${shareToken}`}>/s/{shareToken}</Link>
        </p>
      ) : (
        <p>This note is private.</p>
      )}
      {isShared ? (
        <form action={disableAction}>
          <input type="hidden" name="noteId" value={noteId} />
          <button type="submit">Disable Share</button>
        </form>
      ) : (
        <form action={enableAction}>
          <input type="hidden" name="noteId" value={noteId} />
          <button type="submit">Enable Share</button>
        </form>
      )}
    </section>
  );
}
