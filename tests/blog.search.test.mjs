import test from 'node:test';
import assert from 'node:assert/strict';
import { decodePostCursor, encodePostCursor, normalizeSearch, postSearchTokens, searchWords } from '../src/lib/blogSearch.js';

test('Title/topic search handles Indonesian text, accents, partial keywords and bounded OR terms', () => {
  const tokens = postSearchTokens({ title: 'Juventus Menang 4–1: Café dan Riset AI', tag: 'Sains & kesehatan' });
  for (const word of ['juventus', 'juve', 'cafe', 'riset', 'ai', 'kesehatan', 'keseh']) assert.ok(tokens.includes(word));
  assert.deepEqual(normalizeSearch('CAFÉ / kesehatan'), ['cafe', 'kesehatan']);
  assert.deepEqual(searchWords('AI ai a teknologi sains ekonomi bola program berita'), ['ai', 'teknologi', 'sains', 'ekonomi', 'bola', 'program']);
  assert.ok(postSearchTokens({ title: 'Abcde '.repeat(200), tag: 'Sains' }).length <= 240);
});
test('Pagination cursor keeps timestamp nanoseconds and document ID for stable tied-date boundaries', () => {
  const cursor = encodePostCursor({ id: 'bot_ABC-123', get: () => ({ seconds: 1795741200, nanoseconds: 7 }) });
  assert.deepEqual(decodePostCursor(cursor), { seconds: 1795741200, nanoseconds: 7, id: 'bot_ABC-123' });
  for (const invalid of ['', '../path', '1795741200.1_foo', '1.1000000000_foo', '1.000000000_<script>']) assert.equal(decodePostCursor(invalid), null);
});
