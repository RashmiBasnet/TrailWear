import sanitizeHtml from 'sanitize-html';

/**
 * Removes every HTML tag and attribute from a free-text value.
 *
 * This is defense in depth: the React frontend already escapes on output and the
 * app has no raw-HTML sinks, so no stored value reaches an interpreter as markup.
 * Stripping at the API boundary means input that could only be markup — a
 * `<script>` in a product name — never reaches the database at all.
 *
 * sanitize-html re-encodes the text that survives (`&` -> `&amp;`, `<` -> `&lt;`,
 * `>` -> `&gt;`), which on its own would corrupt ordinary input such as
 * "Trinidad & Tobago" or "size < M". We decode those three back, so legitimate
 * text round-trips unchanged while real tags stay stripped. In text context
 * sanitize-html leaves quotes and apostrophes alone, so those need no decoding.
 *
 * Apply ONLY to plain free-text fields. Never run it on passwords, emails,
 * enums, IDs, or numbers — those are validated by type, and stripping them would
 * silently alter or weaken the value.
 */
export function stripHtml(value: string): string {
  const stripped = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
  return stripped
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
