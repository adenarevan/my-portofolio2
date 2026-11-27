export const ARTICLE_IMAGES = [
  { id: 'orbit', label: 'Orbit & antariksa', src: '/blog-media/orbit-station.jpg', alt: 'Stasiun Luar Angkasa Internasional di atas lengkungan Bumi', caption: 'Stasiun Luar Angkasa Internasional pada misi STS-135, Juli 2011. Ilustrasi infrastruktur di orbit.', credit: 'NASA · Public domain', creditUrl: 'https://commons.wikimedia.org/wiki/File:STS-135_final_flyaround_of_ISS_1.jpg' },
  { id: 'computing', label: 'Teknologi & komputasi', src: '/blog-media/computing.jpg', alt: 'Deretan rak superkomputer Pleiades di NASA Ames Research Center', caption: 'Superkomputer Pleiades di NASA Ames Research Center. Foto arsip, 2008.', credit: 'Marco Librero / NASA Ames · Public domain', creditUrl: 'https://commons.wikimedia.org/wiki/File:Pleiades_supercomputer.jpg' },
  { id: 'workspace', label: 'Karier & catatan', src: '/blog-media/workspace.jpg', alt: 'Laptop, telepon, dan beberapa buku di atas meja kerja', caption: 'Ilustrasi ruang kerja dan perangkat untuk belajar serta berkarya.', credit: 'Aleksi Tappura · CC0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Laptop_on_a_desk_(Unsplash).jpg' },
];

export function safeImageSrc(value) {
  if (typeof value !== 'string' || value.length > 2048 || /\s/.test(value) || Array.from(value).some(char => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) return null;
  if (/^\/blog-media\/[a-z0-9][a-z0-9._-]*\.(?:jpg|jpeg|png|webp|avif)$/i.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname || url.port && url.port !== '443') return null;
    if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(url.hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(url.hostname)) return null;
    return url.href;
  } catch { return null; }
}

export function normalizeArticleImage(input) {
  const src = safeImageSrc(input?.src);
  if (!src) return null;
  const text = (key, max) => typeof input[key] === 'string' ? input[key].trim().slice(0, max) : '';
  const creditUrl = safeImageSrc(input.creditUrl);
  return { src, alt: text('alt', 240), caption: text('caption', 300), credit: text('credit', 180), creditUrl: creditUrl?.startsWith('https:') ? creditUrl : '' };
}

export function defaultArticleImage(post = {}) {
  if (Array.isArray(post.bot?.imageUrls) && !post.bot.imageUrls.length) return null;
  const topic = `${post.title || ''} ${post.tag || ''} ${post.excerpt || ''}`;
  if (/\b(spacex|satelit|satellite|orbit|antariksa|space|nasa|roket|astronaut)\b/i.test(topic)) return ARTICLE_IMAGES[0];
  return ARTICLE_IMAGES[/\b(ai|kecerdasan|teknologi|technology|chip|pusat data|data center|superkomputer|server|komputasi)\b/i.test(topic) ? 1 : 2];
}
