import { normalizeArticleImage } from './articleMedia.js';

const API = 'https://commons.wikimedia.org/w/api.php';
const searchCache = new Map();
const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
// Metadata stays plain text in React/Tiptap; never render it as HTML.
function plain(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, entity) => {
    if (!entity.startsWith('#')) return entities[entity.toLowerCase()] || '';
    const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
  }).replace(/\s+/g, ' ').trim();
}
function wikiUrl(value, hosts) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !hosts.includes(url.hostname) || url.username || url.password || url.port) return null;
    url.search = ''; url.hash = '';
    return url.href;
  } catch { return null; }
}
export function commonsImage(page) {
  const info = page?.imageinfo?.[0], meta = info?.extmetadata;
  if (!info || !meta || !['image/jpeg', 'image/png', 'image/webp'].includes(info.mime)
    || info.width < 640 || info.height < 400 || info.width / info.height < .6 || info.width / info.height > 2.3) return null;
  const license = plain(meta.LicenseShortName?.value);
  if (!/^(?:CC0(?: 1\.0)?|Public domain|CC BY(?:-SA)? [1-4]\.0)$/i.test(license)
    || meta.Restrictions?.value || /non.?commercial|no.?derivatives/i.test(license)) return null;
  const artist = plain(meta.Artist?.value);
  const name = plain(meta.ObjectName?.value || page.title?.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''));
  // Keep the full required credit within the existing editor field limit.
  if (!name || name.length > 180 || !artist || `${artist} · ${license}`.length > 180) return null;
  const src = wikiUrl(info.thumburl || info.url, ['upload.wikimedia.org', 'thumb.wikimedia.org']);
  const creditUrl = wikiUrl(info.descriptionurl, ['commons.wikimedia.org']);
  if (!src || !creditUrl) return null;
  return normalizeArticleImage({ src, alt: name, caption: `Ilustrasi: ${name}. Foto dokumentasi, bukan foto peristiwa yang diberitakan.`, credit: `${artist} · ${license}`, creditUrl });
}

export async function searchArticleImages(query, { fetchImpl = fetch, signal, limit = 6 } = {}) {
  const term = String(query || '').replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
  if (term.length < 2) return [];
  const cacheKey = `${term.toLowerCase()}:${limit}`;
  const cached = fetchImpl === fetch ? searchCache.get(cacheKey) : null;
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.images;
  const url = new URL(API);
  url.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', origin: '*', generator: 'search', gsrnamespace: '6',
    gsrsearch: `${term} filetype:bitmap`, gsrlimit: '12', prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1280',
    iiextmetadatafilter: 'Artist|ObjectName|LicenseShortName|Restrictions' }).toString();
  const headers = { Accept: 'application/json' };
  if (typeof window === 'undefined') headers['User-Agent'] = 'AdenaPortfolioBlog/1.0 (https://www.myadenarevan.site; article illustrations)';
  const response = await fetchImpl(url.href, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000), headers });
  if (!response.ok) { await response.body?.cancel(); throw new Error(`Pencarian gambar gagal (HTTP ${response.status}).`); }
  const raw = await response.text();
  if (raw.length > 300000) throw new Error('Respons gambar terlalu besar.');
  const data = JSON.parse(raw);
  if (data.error) throw new Error('Pencarian gambar belum tersedia. Coba lagi.');
  const seen = new Set();
  const words = value => plain(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').match(/[\p{L}\p{N}]+/gu) || [];
  const terms = words(term).filter(word => word.length > 2 && !['the', 'and', 'with', 'photo'].includes(word));
  const images = (data.query?.pages || []).sort((a, b) => a.index - b.index).flatMap(page => {
    const image = commonsImage(page);
    if (!image || seen.has(image.src)) return [];
    // Commons search also matches hidden categories. A crab search must not select
    // an unrelated ship or spider merely because its categories share a word.
    const subject = words(`${page.title} ${image.alt}`);
    if (terms.length && terms.filter(term => subject.some(word => word === term || word === `${term}s`)).length < Math.min(2, terms.length)) return [];
    seen.add(image.src); return [{ ...image, previewSrc: image.src.replace('/1280px-', '/330px-') }];
  }).slice(0, Math.min(6, Math.max(1, limit)));
  if (fetchImpl === fetch) {
    if (searchCache.size >= 30) searchCache.delete(searchCache.keys().next().value);
    searchCache.set(cacheKey, { at: Date.now(), images });
  }
  return images;
}
