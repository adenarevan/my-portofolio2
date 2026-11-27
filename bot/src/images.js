import { searchArticleImages } from '../../src/lib/articleImageSearch.js';

export async function verifyArticleImage(image, fetchImpl = fetch) {
  const url = new URL(image.src);
  if (url.protocol !== 'https:' || !['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(url.hostname)) return false;
  const response = await fetchImpl(url.href, { method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'AdenaPortfolioBlog/1.0 (https://www.myadenarevan.site; article illustrations)' } });
  await response.body?.cancel();
  return response.ok && /^image\/(jpeg|png|webp)(;|$)/i.test(response.headers.get('content-type') || '');
}

export async function findArticleImages(article, diagnostics, { search = searchArticleImages, verify = verifyArticleImage, used = new Set() } = {}) {
  const images = [];
  for (const query of (article.imageQueries || []).slice(0, 2)) {
    try {
      const results = await search(query);
      let image;
      for (const result of results.filter(result => !used.has(result.src) && !images.some(selected => selected.src === result.src)).slice(0, 3)) {
        try { if (await verify(result)) { image = result; break; } }
        catch { /* Try another candidate; no broken photo is inserted. */ }
      }
      if (image) images.push(image);
      diagnostics.push({ stage: 'image', source: 'Wikimedia Commons', status: image ? 'ok' : 'skipped', query,
        message: image ? `Ilustrasi berlisensi: ${image.alt}`.slice(0, 180) : 'Tidak ada gambar berlisensi yang cocok dan belum digunakan.', ...(image ? { url: image.creditUrl } : {}) });
    } catch (error) {
      diagnostics.push({ stage: 'image', source: 'Wikimedia Commons', status: 'failed', query, message: error.message.slice(0, 180) });
    }
  }
  return images;
}
