import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTICLE_IMAGES, defaultArticleImage, normalizeArticleImage, safeImageSrc } from '../src/lib/articleMedia.js';
import { articleOutline } from '../src/lib/articleReading.js';
import { bodyText, richDocument, serializeBody } from '../src/lib/richText.js';

test('Image URLs reject executable, embedded, local-network and credential-bearing URLs', () => {
  for (const src of ['javascript:alert(1)', 'data:image/png;base64,abc', 'blob:https://example.com/a', 'http://example.com/image.jpg', '//evil.test/img.jpg', '/other/file.jpg', '/blog-media/../secret.jpg', 'https://user:pass@example.com/x.jpg', 'https://localhost/img.png', 'https://127.0.0.1/x', 'https://2130706433/x', 'https://10.1.2.3/x', 'https://169.254.169.254/x', 'https://172.31.2.4/x', 'https://[::1]/x', 'https://example.com:8080/x']) assert.equal(safeImageSrc(src), null, src);
  assert.equal(safeImageSrc('/blog-media/computing.jpg'), '/blog-media/computing.jpg');
  assert.equal(safeImageSrc('https://images.example.com/photo.jpg?v=1'), 'https://images.example.com/photo.jpg?v=1');
});

test('Image descriptions and credits survive editing without introducing executable HTML', () => {
  const image = { ...ARTICLE_IMAGES[0], onerror: 'alert(1)', style: 'position:fixed', alt: '<b>Orbit</b>' };
  const body = serializeBody({ type: 'doc', content: [{ type: 'image', attrs: image }, { type: 'paragraph', content: [{ type: 'text', text: 'Tulisan tetap utuh setelah gambar.' }] }] });
  const node = richDocument(body).content[0];
  assert.equal(node.type, 'image'); assert.equal(node.attrs.src, image.src); assert.equal(node.attrs.alt, '<b>Orbit</b>'); assert.equal(node.attrs.credit, image.credit);
  assert.equal(node.attrs.onerror, undefined); assert.equal(node.attrs.style, undefined); assert.equal(bodyText(body).trim(), 'Tulisan tetap utuh setelah gambar.');
  assert.deepEqual(normalizeArticleImage({ src: 'javascript:alert(1)' }), null);
});

test('Headings get stable unique anchor IDs; only the first meaningful image becomes the cover', () => {
  const heading = text => ({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] });
  const body = serializeBody({ type: 'doc', content: [{ type: 'paragraph' }, { type: 'image', attrs: ARTICLE_IMAGES[0] }, heading('Bagian yang sama'), heading('Bagian yang sama'), { type: 'image', attrs: ARTICLE_IMAGES[1] }] });
  const outline = articleOutline(body);
  assert.equal(outline.cover.src, ARTICLE_IMAGES[0].src); assert.deepEqual(outline.headings.map(h => h.id), ['article-section-2', 'article-section-3']);
  assert.equal(articleOutline(serializeBody({ type: 'doc', content: [heading('Pembuka'), { type: 'image', attrs: ARTICLE_IMAGES[0] }] })).cover, null);
  assert.deepEqual(articleOutline('Artikel teks lama tanpa format'), { headings: [], cover: null });
});

test('An image-only edit stays unsaved content but does not count as article text', () => {
  const body = serializeBody({ type: 'doc', content: [{ type: 'image', attrs: ARTICLE_IMAGES[0] }] });
  assert.ok(body.startsWith('tiptap:v1:')); assert.equal(bodyText(body), '');
  assert.equal(defaultArticleImage({ title: 'Pusat data SpaceX di orbit' }).id, 'orbit');
  assert.equal(defaultArticleImage({ title: 'Catatan React dan API' }).id, 'workspace');
  assert.equal(defaultArticleImage({ title: 'Belajar tentang pusat data AI' }).id, 'computing');
  assert.equal(defaultArticleImage({ title: 'Informasi karier dan lowongan' }).id, 'workspace');
});
