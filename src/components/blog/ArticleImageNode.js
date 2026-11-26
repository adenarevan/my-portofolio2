import { Node } from '@tiptap/react';
import { normalizeArticleImage } from '../../lib/articleMedia';

export const ArticleImageNode = Node.create({
  name: 'image', group: 'block', atom: true, draggable: true,
  addAttributes() { return Object.fromEntries(['src', 'alt', 'caption', 'credit', 'creditUrl'].map(key => [key, { default: '' }])); },
  parseHTML() {
    return [{ tag: 'figure[data-article-image]', getAttrs: element => normalizeArticleImage({ src: element.querySelector('img')?.getAttribute('src'), alt: element.querySelector('img')?.getAttribute('alt'), caption: element.dataset.caption, credit: element.dataset.credit, creditUrl: element.dataset.creditUrl }) || false }, { tag: 'img[src]', getAttrs: element => normalizeArticleImage({ src: element.getAttribute('src'), alt: element.getAttribute('alt') }) || false }];
  },
  renderHTML({ node }) {
    const image = normalizeArticleImage(node.attrs);
    if (!image) return ['span'];
    return ['figure', { 'data-article-image': '', 'data-caption': image.caption, 'data-credit': image.credit, 'data-credit-url': image.creditUrl }, ['img', { src: image.src, alt: image.alt, loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' }], ['figcaption', {}, [image.caption, image.credit].filter(Boolean).join(' · ')]];
  },
});
