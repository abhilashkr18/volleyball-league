// Helpers that turn the plain text of an About block into structured pieces.
// Lines of stats, timelines, cards, steps and people use " | " between fields.
export function rows(body, n) {
  return String(body || '')
    .split('\n')
    .filter((l) => l.trim() !== '')
    .map((l) => {
      const parts = l.split(' | ');
      const head = parts.slice(0, n - 1).map((s) => s.trim());
      const last = parts.slice(n - 1).join(' | ').trim();
      const out = [...head, last];
      while (out.length < n) out.push('');
      return out;
    });
}

export function paragraphs(body) {
  return String(body || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

// "A • B • C" becomes a list of chips. Returns null when the text is not a list of names.
export function chips(text) {
  const t = String(text || '');
  if (!t.includes(' • ')) return null;
  const items = t.split(' • ').map((s) => s.trim()).filter(Boolean);
  return items.length >= 3 ? items : null;
}
