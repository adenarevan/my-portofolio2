export const BOT_CATEGORIES = { ai: 'AI', technology: 'Teknologi', programming: 'Pemrograman' };
export const BOT_REGIONS = { ID: 'Indonesia', GLOBAL: 'Global' };
// Fixed catalog: client settings never become arbitrary server-side fetch URLs.
export const RSS_SOURCES = [
  { id: 'antara', name: 'ANTARA Tekno', publisher: 'antara', region: 'ID', url: 'https://www.antaranews.com/rss/tekno.xml', hosts: ['www.antaranews.com', 'antaranews.com'] },
  { id: 'cnn', name: 'CNN Indonesia Teknologi', publisher: 'ctcorp', region: 'ID', url: 'https://www.cnnindonesia.com/teknologi/rss', hosts: ['www.cnnindonesia.com', 'cnnindonesia.com'] },
  { id: 'cnbc', name: 'CNBC Indonesia Tech', publisher: 'ctcorp', region: 'ID', url: 'https://www.cnbcindonesia.com/tech/rss', hosts: ['www.cnbcindonesia.com', 'cnbcindonesia.com'] },
  { id: 'techcrunch', name: 'TechCrunch', publisher: 'techcrunch', region: 'GLOBAL', url: 'https://techcrunch.com/feed/', hosts: ['techcrunch.com', 'www.techcrunch.com'] },
  { id: 'verge', name: 'The Verge', publisher: 'vox', region: 'GLOBAL', url: 'https://www.theverge.com/rss/index.xml', hosts: ['www.theverge.com', 'theverge.com'] },
];
export const DEFAULT_BOT_SETTINGS = { enabled: false, categories: ['ai', 'technology', 'programming'], region: 'ID', windowHours: 24, time: '08:00', timeZone: 'Asia/Jakarta', days: [0, 1, 2, 3, 4, 5, 6], maxArticles: 1, sourceIds: RSS_SOURCES.map(source => source.id) };

export function activeSources(settings) {
  return RSS_SOURCES.filter(source => settings.sourceIds.includes(source.id) && (settings.region === 'GLOBAL' || source.region === settings.region));
}
export function validateSettings(input) {
  const keys = Object.keys(DEFAULT_BOT_SETTINGS);
  if (!input || typeof input !== 'object' || Object.keys(input).some(key => !keys.includes(key))) throw new Error('Pengaturan bot tidak valid.');
  const s = { ...DEFAULT_BOT_SETTINGS, ...input };
  const unique = (items, allowed) => Array.isArray(items) && items.length > 0 && new Set(items).size === items.length && items.every(item => allowed.includes(item));
  if (typeof s.enabled !== 'boolean' || !unique(s.categories, Object.keys(BOT_CATEGORIES)) || !Object.hasOwn(BOT_REGIONS, s.region)
    || ![6, 12, 24, 72, 168].includes(s.windowHours) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time) || s.timeZone !== 'Asia/Jakarta'
    || !unique(s.days, [0, 1, 2, 3, 4, 5, 6]) || !Number.isInteger(s.maxArticles) || s.maxArticles < 1 || s.maxArticles > 3
    || !unique(s.sourceIds, RSS_SOURCES.map(source => source.id))) throw new Error('Periksa kategori, wilayah, hari, waktu WIB, dan batas 1–3 artikel.');
  if (new Set(activeSources(s).map(source => source.publisher)).size < 2) throw new Error('Pilih minimal dua penerbit independen untuk wilayah ini. CNN dan CNBC dihitung sebagai satu grup.');
  return Object.fromEntries(keys.map(key => [key, s[key]]));
}

export function scheduledSlot(settings, date = new Date()) {
  if (!settings.enabled) return null;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(part => [part.type, part.value]));
  // Midnight WIB belongs to the previous UTC day. Use noon to determine the local weekday.
  const localDay = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00+07:00`).getUTCDay();
  const [hour, minute] = settings.time.split(':').map(Number);
  const elapsed = Number(parts.hour) * 60 + Number(parts.minute) - hour * 60 - minute;
  if (!settings.days.includes(localDay) || elapsed < 0 || elapsed >= 60) return null;
  return `scheduled-${parts.year}-${parts.month}-${parts.day}`;
}
