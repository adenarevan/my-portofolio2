import test from 'node:test';
import assert from 'node:assert/strict';
import { bodyText, bodyToDocument, richDocument, RICH_TEXT_PREFIX, safeLink, serializeBody } from '../src/lib/richText.js';

test('Existing text preserves paragraph breaks, single line breaks, and literal HTML', () => {
  const text = 'Paragraf satu\nBaris kedua\n\n<script>alert(1)</script>';
  const document = bodyToDocument(text);
  assert.equal(document.content.length, 2);
  assert.equal(document.content[0].content[1].type, 'hardBreak');
  assert.equal(document.content[1].content[0].text, '<script>alert(1)</script>');
  assert.equal(bodyText(text), text);
  assert.equal(bodyText(serializeBody(document)), 'Paragraf satu\nBaris kedua\n<script>alert(1)</script>');
});

test('Rich posts retain supported formats through serialization and editing', () => {
  const document = { type: 'doc', content: [
    { type: 'heading', attrs: { level: 3, textAlign: 'center' }, content: [{ type: 'text', text: 'Judul' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Penting', marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'textStyle', attrs: { fontSize: '32px' } }, { type: 'link', attrs: { href: 'https://example.com/' } }] }] },
    { type: 'orderedList', attrs: { start: 2 }, content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Langkah' }] }] }] },
  ] };
  const body = serializeBody(document);
  assert.deepEqual(bodyToDocument(body), document);
  assert.equal(serializeBody(bodyToDocument(body)), body);
  assert.equal(bodyText(body), 'Judul\nPenting\nLangkah');
});

test('Empty rich documents cannot masquerade as post content', () => {
  for (const document of [{ type: 'doc' }, { type: 'doc', content: [{ type: 'paragraph' }] }, { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' \n ' }] }] }]) assert.equal(serializeBody(document), '');
});

test('Only safe web and mail links are accepted', () => {
  for (const href of ['javascript:alert(1)', 'data:text/html,hello', 'vbscript:alert(1)', '//example.com', '/admin', 'https://exam\nple.com', 'file:///etc/passwd', 'mailto:', null]) assert.equal(safeLink(href), null);
  assert.equal(safeLink('https://example.com/path?q=one'), 'https://example.com/path?q=one');
  assert.equal(safeLink('mailto:owner@example.com'), 'mailto:owner@example.com');
});

test('Unsupported nodes, event attributes, injected CSS and unsafe marks are removed', () => {
  const body = RICH_TEXT_PREFIX + JSON.stringify({ type: 'doc', content: [
    { type: 'script', content: [{ type: 'text', text: 'alert(1)' }] },
    { type: 'paragraph', attrs: { onclick: 'alert(1)', textAlign: 'expression(alert(1))' }, content: [{ type: 'text', text: 'Safe', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }, { type: 'textStyle', attrs: { fontSize: '999px;background:url(x)', color: 'red' } }, { type: 'bold', attrs: { onmouseover: 'alert(1)' } }] }] },
  ] });
  assert.deepEqual(richDocument(body), { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Safe', marks: [{ type: 'bold' }] }] }] });
});

test('Malformed versioned strings and non-doc JSON remain readable text', () => {
  for (const body of ['tiptap:v1:{broken', 'tiptap:v1:{"type":"script"}', '{"type":"doc"}']) {
    assert.equal(richDocument(body), null);
    assert.equal(bodyText(body), body);
    assert.equal(bodyToDocument(body).content[0].content[0].text, body);
  }
});
