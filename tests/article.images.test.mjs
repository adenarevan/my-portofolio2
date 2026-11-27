import test from 'node:test';
import assert from 'node:assert/strict';
import { commonsImage, searchArticleImages } from '../src/lib/articleImageSearch.js';
import { findArticleImages } from '../bot/src/images.js';

const page = (name = 'Juventus stadium Turin', override = {}) => ({ title: `File:${name}.jpg`, index: 1, imageinfo: [{ mime: 'image/jpeg', width: 1600, height: 1000,
  thumburl: `https://upload.wikimedia.org/wikipedia/commons/a/ab/${name.replaceAll(' ', '_')}.jpg?utm_source=commons`, descriptionurl: 'https://commons.wikimedia.org/wiki/File:Stadium.jpg',
  extmetadata: { Artist: { value: '<a href="javascript:alert(1)">Photo &amp; Author</a>' }, ObjectName: { value: name }, LicenseShortName: { value: 'CC BY-SA 4.0' } }, ...override }] });
const response = pages => async () => new Response(JSON.stringify({ query: { pages } }));

test('Commons preserves plain-text credit and source, rejects unclear licensing and unsafe media', () => {
  const image = commonsImage(page());
  assert.equal(image.credit, 'Photo & Author · CC BY-SA 4.0');
  assert.ok(!image.src.includes('?')); assert.match(image.caption, /bukan foto peristiwa/);
  for (const license of ['CC BY-NC 4.0', 'CC BY-ND 4.0', 'Fair use', '', 'GFDL']) assert.equal(commonsImage(page('Test', { extmetadata: { ...page().imageinfo[0].extmetadata, LicenseShortName: { value: license } } })), null);
  for (const override of [{ mime: 'image/svg+xml' }, { width: 50 }, { height: 50 }, { thumburl: 'https://evil.test/picture.jpg' }, { descriptionurl: 'javascript:alert(1)' }, { extmetadata: {} }]) assert.equal(commonsImage(page('Test', override)), null);
});

test('Search avoids hidden-category mismatches, deduplicates, and strips query operators', async () => {
  let request;
  const images = await searchArticleImages('Papua crab', { fetchImpl: async (url, options) => {
    request = new URL(url); assert.ok(options.signal);
    return response([page('Crab Spider'), page('Pacific Blue Crab Papua'), page('Unrelated boat in Papua'), page('Pacific Blue Crab Papua')])();
  } });
  assert.equal(images.length, 1); assert.equal(images[0].alt, 'Pacific Blue Crab Papua');
  assert.equal(request.searchParams.get('gsrnamespace'), '6');
  assert.equal(request.searchParams.get('origin'), '*');
  await searchArticleImages('Juventus :foo|bar', { fetchImpl: async url => { assert.equal(new URL(url).searchParams.get('gsrsearch'), 'Juventus foo bar filetype:bitmap'); return response([])(); } });
  await assert.rejects(searchArticleImages('Juventus', { fetchImpl: async () => new Response('down', { status: 503 }) }), /503/);
  assert.deepEqual(await searchArticleImages('x', { fetchImpl: () => { throw Error('must not fetch'); } }), []);
});

test('Bot chooses different images across posts and queries; image failures do not block article creation', async () => {
  const a = commonsImage(page('Juventus stadium Turin')), b = commonsImage(page('Turin football stadium')), c = commonsImage(page('Juventus museum Turin'));
  const logs = [];
  const images = await findArticleImages({ imageQueries: ['Juventus stadium', 'Juventus museum'] }, logs, { used: new Set([a.src]), search: async () => [a, b, c], verify: async () => true });
  assert.deepEqual(images.map(image => image.src), [b.src, c.src]); assert.ok(logs.every(log => log.status === 'ok'));
  const errors = [];
  assert.deepEqual(await findArticleImages({ imageQueries: ['Stadium', 'Museum'] }, errors, { search: async () => { throw Error('HTTP 503'); } }), []);
  assert.equal(errors.length, 2); assert.ok(errors.every(log => log.status === 'failed'));
  const unavailable = [];
  assert.deepEqual(await findArticleImages({ imageQueries: ['Juventus stadium'] }, unavailable, { search: async () => [a], verify: async () => false }), []);
  assert.equal(unavailable[0].status, 'skipped');
});
