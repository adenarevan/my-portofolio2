import { richDocument } from './richText.js';

export const nodeText = node => node.type === 'text' ? node.text : (node.content || []).map(nodeText).join('');
export function coverIndex(document) {
  const index = document?.content?.findIndex(node => node.type === 'image' || nodeText(node).trim());
  return index >= 0 && document.content[index].type === 'image' ? index : -1;
}

export function articleOutline(body) {
  const document = richDocument(body); const headings = [];
  const walk = (nodes, prefix = '') => (nodes || []).forEach((node, index) => {
    const key = prefix ? `${prefix}-${index}` : String(index);
    if (node.type === 'heading' && nodeText(node).trim() && headings.length < 50) headings.push({ id: `article-section-${key}`, text: nodeText(node), level: node.attrs.level });
    walk(node.content, key);
  });
  walk(document?.content);
  const index = coverIndex(document);
  return { headings, cover: index >= 0 ? document.content[index].attrs : null };
}
