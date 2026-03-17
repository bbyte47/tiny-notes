declare module "sanitize-html" {
  export interface IOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    disallowedTagsMode?: "discard" | "completelyDiscard" | "escape" | "recursiveEscape";
  }

  export default function sanitizeHtml(dirty: string, options?: IOptions): string;
}
