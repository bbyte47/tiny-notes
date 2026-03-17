import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import sanitizeHtml from "sanitize-html";

const FALLBACK_HTML = "<p>This note could not be rendered.</p>";

const allowedTags = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
];

const allowedAttributes: Record<string, string[]> = {
  code: ["class"],
};

function parseTipTapDocument(contentJson: string): JSONContent | null {
  try {
    const parsed = JSON.parse(contentJson) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate = parsed as { type?: unknown; content?: unknown };
    if (candidate.type !== "doc" || !Array.isArray(candidate.content)) {
      return null;
    }

    return candidate as JSONContent;
  } catch {
    return null;
  }
}

export function renderSanitizedNoteHtml(contentJson: string): string {
  const document = parseTipTapDocument(contentJson);
  if (!document) {
    return FALLBACK_HTML;
  }

  try {
    const renderedHtml = generateHTML(document, [StarterKit]);
    const sanitized = sanitizeHtml(renderedHtml, {
      allowedTags,
      allowedAttributes,
      disallowedTagsMode: "discard",
    });

    return sanitized.trim().length > 0 ? sanitized : FALLBACK_HTML;
  } catch {
    return FALLBACK_HTML;
  }
}
