import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { load } from 'cheerio';
import { activeSources } from './botConfig.js';

export const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 32);
const words = {
  ai: /\b(ai|artificial intelligence|kecerdasan buatan|openai|chatgpt|gpt|gemini|claude|anthropic|llm|deepseek)\b/i,
  technology: /\b(teknologi|technology|digital|internet|software|perangkat|chip|smartphone|apple|google|microsoft|nvidia|samsung|siber|cyber|data|robot|gadget)\b/i,
  programming: /\b(pemrograman|programming|pengembang|developer|coding|javascript|typescript|python|react|github|database|api|node[ .]js|open source|perangkat lunak)\b/i,
};
const stops = new Set('yang dan di ke dari untuk dengan ini itu pada dalam atau bisa akan baru model rilis luncurkan meluncurkan hadir kenalkan perkenalkan diluncurkan resmi the a an to of in for on with new launches launch release releases announces announced is its and ai teknologi technology update terbaru'.split(' '));
export const titleTokens = title => [...new Set((title.toLowerCase().normalize('NFKD').match(/[a-z0-9]+(?:[.-][a-z0-9]+)*/g) || []).filter(word => word.length > 1 && !stops.has(word)))].sort();
export function sameTopic(a, b) {
  if (!a.length || !b.length) return false;
  const common = a.filter(word => b.includes(word)).length;
  const versionsA = a.filter(word => /\d/.test(word)), versionsB = b.filter(word => /\d/.test(word));
  if (versionsA.length && versionsB.length && !versionsA.some(word => versionsB.includes(word))) return false;
  return common >= 2 && (common / (a.length + b.length - common) >= .45 || common >= 3 && common / Math.min(a.length, b.length) >= .65);
}
export function canonicalUrl(value, source) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port && url.port !== '443' || !source.hosts.includes(url.hostname)) return null;
    url.protocol = 'https:'; url.hash = '';
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid|ref$)/i.test(key)) url.searchParams.delete(key);
    return url.href;
  } catch { return null; }
}

export async function fetchSource(url, source, maxBytes = 1500000, redirects = 0) {
  const safe = canonicalUrl(url, source);
  if (!safe || redirects > 3) throw new Error('Alamat sumber tidak diizinkan.');
  const response = await fetch(safe, { redirect: 'manual', signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'PortfolioTrendingBot/1.0 (+RSS; source attribution)', Accept: 'application/rss+xml, application/atom+xml, text/xml, text/html' } });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get('location');
    await response.body?.cancel();
    if (!location) throw new Error('Redirect sumber tidak valid.');
    return fetchSource(new URL(location, safe).href, source, maxBytes, redirects + 1);
  }
  if (!response.ok) { await response.body?.cancel(); throw new Error(`Sumber merespons HTTP ${response.status}.`); }
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length; if (size > maxBytes) throw new Error('Ukuran sumber melewati batas.');
      chunks.push(Buffer.from(value));
    }
  } finally { await reader.cancel(); }
  return { text: Buffer.concat(chunks).toString('utf8'), url: safe };
}
export function plainText(html) {
  const $ = load(String(html || '').slice(0, 500000));
  $('script,style,iframe,nav,footer,header,aside,form,button,noscript').remove();
  return $.text().replace(/\s+/g, ' ').trim();
}
const array = value => Array.isArray(value) ? value : value ? [value] : [];
const scalar = value => typeof value === 'object' && value ? value['#text'] || '' : String(value || '');
export function parseFeed(xml, source) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || !/<(?:rss|feed)\b/.test(xml)) throw new Error('Feed RSS/Atom tidak valid.');
  const parsed = new XMLParser({ ignoreAttributes: false, processEntities: false }).parse(xml);
  const items = parsed.rss?.channel?.item || parsed.feed?.entry;
  return array(items).slice(0, 50).flatMap(item => {
    const link = typeof item.link === 'string' ? item.link : array(item.link).find(link => !link['@_rel'] || link['@_rel'] === 'alternate')?.['@_href'];
    const url = canonicalUrl(link, source);
    const title = plainText(scalar(item.title)).slice(0, 300);
    const date = new Date(scalar(item.pubDate || item.published || item.updated || item['dc:date']));
    const summary = plainText(scalar(item.description || item.summary || item['content:encoded'] || item.content)).slice(0, 4000);
    return url && title && Number.isFinite(date.getTime()) ? [{ title, url, summary, publishedAt: date.toISOString(), sourceId: source.id, publisher: source.publisher, sourceName: source.name, region: source.region, tokens: titleTokens(title) }] : [];
  });
}
export function selectCandidates(items, settings, now = new Date()) {
  const seen = new Set(); const groups = [];
  const stats = { stale: 0, category: 0, region: 0, repeatedUrl: 0, singlePublisher: 0 };
  for (const item of items) {
    const age = now.getTime() - new Date(item.publishedAt).getTime();
    if (age < -300000 || age > settings.windowHours * 3600000) { stats.stale++; continue; }
    if (settings.region !== 'GLOBAL' && item.region !== settings.region) { stats.region++; continue; }
    const categories = settings.categories.filter(category => words[category]?.test(`${item.title} ${item.summary}`));
    if (!categories.length) { stats.category++; continue; }
    if (seen.has(item.url)) { stats.repeatedUrl++; continue; } seen.add(item.url);
    const group = groups.find(group => group.items.some(other => sameTopic(other.tokens, item.tokens)));
    if (group) { group.items.push(item); group.categories = [...new Set([...group.categories, ...categories])]; }
    else groups.push({ title: item.title, tokens: item.tokens, items: [item], categories });
  }
  const candidates = groups.filter(group => {
    if (new Set(group.items.map(item => item.publisher)).size < 2) { stats.singlePublisher++; return false; }
    return true;
  }).sort((a, b) => new Set(b.items.map(item => item.publisher)).size - new Set(a.items.map(item => item.publisher)).size || new Date(b.items[0].publishedAt) - new Date(a.items[0].publishedAt));
  return { candidates, stats };
}
export async function collectCandidates(settings, report, now = new Date(), read = fetchSource) {
  const items = [];
  await Promise.all(activeSources(settings).map(async source => {
    try { const { text } = await read(source.url, source); const entries = parseFeed(text, source); items.push(...entries); report.push({ source: source.name, stage: 'rss', status: 'ok', count: entries.length }); }
    catch (error) { report.push({ source: source.name, stage: 'rss', status: 'failed', message: error.message.slice(0, 180) }); }
  }));
  return selectCandidates(items, settings, now);
}
export async function readableSources(candidate, report, read = fetchSource) {
  const sources = [];
  // Prefer different publishers, then additional coverage. At most three source reads per topic.
  const ordered = [...candidate.items].sort((a, b) => candidate.items.filter(item => item.publisher === a.publisher).length - candidate.items.filter(item => item.publisher === b.publisher).length);
  const seen = new Set();
  for (const item of ordered) {
    if (seen.has(item.publisher)) continue; seen.add(item.publisher);
    if (sources.length === 3) break;
    let text = item.summary; let material = 'rss-summary';
    const source = activeSources({ sourceIds: [item.sourceId], region: 'GLOBAL' })[0];
    try {
      const response = await read(item.url, source);
      const $ = load(response.text); $('script,style,nav,footer,header,aside,form,button,noscript,.ads,.advertisement').remove();
      const root = $('article, [itemprop="articleBody"], .detail__body-text, .read__content, main').first();
      const article = root.find('p').map((_, element) => $(element).text().trim()).get().filter(text => text.length > 50).join('\n');
      if (article.length >= 350) { text = article; material = 'article'; }
    } catch (error) { report.push({ source: item.sourceName, url: item.url, stage: 'article', status: 'failed', message: error.message.slice(0, 180) }); }
    if (text.length < 180) { report.push({ source: item.sourceName, url: item.url, stage: 'article', status: 'skipped', message: 'Bahan terbaca terlalu singkat (kurang dari 180 karakter).' }); continue; }
    sources.push({ ...item, id: `S${sources.length + 1}`, text: text.slice(0, 4000), material });
  }
  return sources;
}
