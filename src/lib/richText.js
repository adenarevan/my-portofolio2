// Versioned JSON stays in the existing Firestore `body` string. Old text remains readable.
import { normalizeArticleImage } from './articleMedia.js';
export const RICH_TEXT_PREFIX = 'tiptap:v1:';
export const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px', '48px'];
export const TEXT_ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const blocks = new Set(['doc', 'paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'codeBlock']);
const simpleMarks = new Set(['bold', 'italic', 'underline', 'strike', 'code']);

export function safeLink(value) {
  if (typeof value !== 'string' || value.length > 2048 || Array.from(value).some(char => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) return null;
  try {
    const url = new URL(value);
    if (['http:', 'https:'].includes(url.protocol) && url.hostname) return url.href;
    if (url.protocol === 'mailto:' && url.pathname) return url.href;
    return null;
  } catch { return null; }
}

function cleanMark(mark) {
  if (simpleMarks.has(mark?.type)) return { type: mark.type };
  if (mark?.type === 'textStyle' && FONT_SIZES.includes(mark.attrs?.fontSize)) return { type: 'textStyle', attrs: { fontSize: mark.attrs.fontSize } };
  if (mark?.type === 'link') {
    const href = safeLink(mark.attrs?.href);
    if (href) return { type: 'link', attrs: { href } };
  }
  return null;
}

function cleanNode(node, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 32) return null;
  if (node.type === 'image') {
    const attrs = normalizeArticleImage(node.attrs);
    return attrs ? { type: 'image', attrs } : null;
  }
  if (node.type === 'text' && typeof node.text === 'string' && node.text) {
    const marks = Array.isArray(node.marks) ? node.marks.map(cleanMark).filter(Boolean) : [];
    return { type: 'text', text: node.text, ...(marks.length ? { marks } : {}) };
  }
  if (['hardBreak', 'horizontalRule'].includes(node.type)) return { type: node.type };
  if (!blocks.has(node.type)) return null;
  const content = Array.isArray(node.content) ? node.content.map(child => cleanNode(child, depth + 1)).filter(Boolean) : [];
  const attrs = {};
  if (node.type === 'heading') attrs.level = [2, 3, 4].includes(node.attrs?.level) ? node.attrs.level : 2;
  if (['paragraph', 'heading'].includes(node.type) && TEXT_ALIGNMENTS.includes(node.attrs?.textAlign)) attrs.textAlign = node.attrs.textAlign;
  if (node.type === 'orderedList' && Number.isInteger(node.attrs?.start) && node.attrs.start > 0 && node.attrs.start < 10000) attrs.start = node.attrs.start;
  return { type: node.type, ...(Object.keys(attrs).length ? { attrs } : {}), ...(content.length ? { content } : {}) };
}

export function richDocument(body) {
  if (typeof body !== 'string' || !body.startsWith(RICH_TEXT_PREFIX)) return null;
  try {
    const parsed = JSON.parse(body.slice(RICH_TEXT_PREFIX.length));
    return parsed?.type === 'doc' ? cleanNode(parsed) : null;
  } catch { return null; }
}

export function bodyToDocument(body = '') {
  const document = richDocument(body);
  if (document) return document.content?.length ? document : { type: 'doc', content: [{ type: 'paragraph' }] };
  return {
    type: 'doc', content: body.split(/\n\s*\n/).map(paragraph => ({
      type: 'paragraph', content: paragraph.split('\n').flatMap((text, index) => [
        ...(index ? [{ type: 'hardBreak' }] : []), ...(text ? [{ type: 'text', text }] : []),
      ]),
    })),
  };
}

function nodeText(node) {
  if (node.type === 'text') return node.text;
  if (node.type === 'hardBreak') return '\n';
  return (node.content || []).map(nodeText).join(['paragraph', 'heading', 'codeBlock'].includes(node.type) ? '' : '\n');
}

export function serializeBody(document) {
  const cleaned = cleanNode(document);
  const hasImage = node => node.type === 'image' || (node.content || []).some(hasImage);
  return cleaned?.type === 'doc' && (nodeText(cleaned).trim() || hasImage(cleaned)) ? RICH_TEXT_PREFIX + JSON.stringify(cleaned) : '';
}

export function bodyText(body = '') {
  const document = richDocument(body);
  return document ? nodeText(document) : body;
}
