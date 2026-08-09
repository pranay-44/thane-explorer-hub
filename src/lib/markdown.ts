/**
 * Minimal, safe Markdown: bold, italic and links only.
 * Input is escaped first, so no user HTML can ever reach the DOM.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function renderBasicMarkdown(input: string): string {
  const escaped = escapeHtml(input);

  const withLinks = escaped.replace(
    /\[([^\]]{1,120})\]\(([^)\s]{1,500})\)/g,
    (match, label: string, url: string) => {
      if (!isSafeUrl(url)) return label;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-accent underline underline-offset-2">${label}</a>`;
    },
  );

  const withBold = withLinks.replace(
    /\*\*([^*]{1,300})\*\*/g,
    "<strong>$1</strong>",
  );
  const withItalic = withBold.replace(
    /(^|[^*])\*([^*]{1,300})\*(?!\*)/g,
    "$1<em>$2</em>",
  );

  return withItalic
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function stripMarkdown(input: string): string {
  return input
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(input: string, length = 150): string {
  const text = stripMarkdown(input);
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}
