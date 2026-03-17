"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle");
  const sharePath = shareToken ? `/s/${shareToken}` : null;

  useEffect(() => {
    setCopyState("idle");
  }, [sharePath]);

  async function handleCopyClick() {
    if (!sharePath || !navigator.clipboard || typeof window === "undefined") {
      setCopyState("error");
      return;
    }

    try {
      const shareUrl = new URL(sharePath, window.location.origin).toString();
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <section>
      <h2>Sharing</h2>
      {isShared && shareToken && sharePath ? (
        <>
          <p>
            Public link: <Link href={sharePath}>{sharePath}</Link>
          </p>
          <div className="share-actions">
            <button type="button" onClick={handleCopyClick}>
              Copy Share Link
            </button>
            {copyState === "success" ? (
              <p className="share-status" role="status">
                Share link copied.
              </p>
            ) : null}
            {copyState === "error" ? (
              <p className="form-error" role="alert">
                Unable to copy the share link.
              </p>
            ) : null}
          </div>
        </>
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
