// Small, bounded keyword index for title/topic search on Firebase Spark.
export const BLOG_PAGE_SIZE = 9;
export const normalizeSearch = value => String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
export const searchWords = value => [...new Set(normalizeSearch(value).filter(word => word.length >= 2))].slice(0, 6);
export function postSearchTokens(post) {
  const tokens = new Set();
  for (const word of normalizeSearch(`${post.title || ''} ${post.tag || ''}`)) {
    if (word.length < 2) continue;
    tokens.add(word);
    for (let length = 2; length < Math.min(word.length, 25); length++) tokens.add(word.slice(0, length));
  }
  return [...tokens].slice(0, 240);
}
export function encodePostCursor(snapshot) {
  if (!snapshot) return '';
  const time = snapshot.get('publishedAt');
  return `${time.seconds}.${String(time.nanoseconds).padStart(9, '0')}_${snapshot.id}`;
}
export function decodePostCursor(value) {
  const match = /^([0-9]{1,12})\.([0-9]{9})_([a-zA-Z0-9_-]{1,128})$/.exec(value || '');
  return match ? { seconds: Number(match[1]), nanoseconds: Number(match[2]), id: match[3] } : null;
}
