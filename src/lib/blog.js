import { arrayUnion, collection, doc, documentId, endBefore, getDoc, getDocs, limit, limitToLast, onSnapshot, orderBy, query, runTransaction, serverTimestamp, startAfter, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import { bodyText } from './richText';
import { BLOG_PAGE_SIZE, decodePostCursor, encodePostCursor, postSearchTokens, searchWords } from './blogSearch';

export const POST_LIMITS = { title: 140, excerpt: 320, body: 50000, tag: 40, slug: 160, metaDescription: 160 };
export const postFromDocument = snapshot => ({ id: snapshot.id, ...snapshot.data() });
export const readingMinutes = body => Math.max(1, Math.ceil(bodyText(body || '').trim().split(/\s+/).filter(Boolean).length / 200));
export function postDate(timestamp, language = 'id') {
  const date = timestamp?.toDate?.();
  return date ? new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-GB', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(date) : '';
}

export function subscribeLatestPosts(count, onData, onError) {
  if (!db) { onData([]); return () => {}; }
  return onSnapshot(query(collection(db, 'portfolioPosts'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(count)), snapshot => onData(snapshot.docs.map(postFromDocument)), onError);
}

export async function loadPublishedPosts(cursor = null, { tag = '', search = '', before = false } = {}) {
  if (!db) return { posts: [], cursor: null, hasMore: false };
  const constraints = [where('status', '==', 'published')];
  if (tag) constraints.push(where('tag', '==', tag.slice(0, POST_LIMITS.tag)));
  const words = searchWords(search);
  if (words.length) constraints.push(where('searchTokens', 'array-contains-any', words));
  constraints.push(orderBy('publishedAt', 'desc'), orderBy(documentId(), 'desc'));
  const parsed = typeof cursor === 'string' ? decodePostCursor(cursor) : null;
  if (parsed) constraints.push((before ? endBefore : startAfter)(new Timestamp(parsed.seconds, parsed.nanoseconds), parsed.id));
  else if (cursor && typeof cursor !== 'string') constraints.push(startAfter(cursor));
  const snapshot = await getDocs(query(collection(db, 'portfolioPosts'), ...constraints, (before && parsed ? limitToLast : limit)(BLOG_PAGE_SIZE + 1)));
  const docs = before && parsed ? snapshot.docs.slice(-BLOG_PAGE_SIZE) : snapshot.docs.slice(0, BLOG_PAGE_SIZE);
  const hasMore = before && parsed ? true : snapshot.size > BLOG_PAGE_SIZE;
  return { posts: docs.map(postFromDocument), cursor: docs.at(-1) || null, firstCursor: encodePostCursor(docs[0]), lastCursor: encodePostCursor(docs.at(-1)), hasMore, hasPrevious: before && parsed ? snapshot.size > BLOG_PAGE_SIZE : Boolean(parsed) };
}

export async function loadBlogTopics() {
  if (!db) return [];
  const snapshot = await getDoc(doc(db, 'portfolioBlogTopics', 'main'));
  return (snapshot.data()?.tags || []).filter(tag => typeof tag === 'string' && tag.trim()).sort((a, b) => a.localeCompare(b, 'id'));
}

export async function loadPost(id) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, 'portfolioPosts', id));
  return snapshot.exists() && snapshot.data().status === 'published' ? postFromDocument(snapshot) : null;
}
export async function loadEditorPost(id) {
  if (!db || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) return null;
  const snapshot = await getDoc(doc(db, 'portfolioPosts', id));
  return snapshot.exists() ? postFromDocument(snapshot) : null;
}

export function subscribeAdminPosts(count, onData, onError) {
  return onSnapshot(query(collection(db, 'portfolioPosts'), orderBy('updatedAt', 'desc'), limit(count)), snapshot => onData({ posts: snapshot.docs.map(postFromDocument), hasMore: snapshot.size === count }), onError);
}

export async function savePost(form, user, status, existing = null) {
  if (!db || !user) throw new Error('blog/unauthorized');
  if (!navigator.onLine) throw new Error('blog/offline');
  const title = form.title.trim();
  const body = form.body.trim();
  const text = bodyText(body).trim();
  const data = { title, body, excerpt: form.excerpt.trim() || text.replace(/\s+/g, ' ').slice(0, 220), tag: form.tag.trim(), status };
  data.searchTokens = postSearchTokens(data);
  // Empty optional metadata does not change the schema of an existing manual post.
  for (const key of ['slug', 'metaDescription']) if (form[key]?.trim() || existing && Object.hasOwn(existing, key)) data[key] = (form[key] || '').trim();
  if (Object.entries(POST_LIMITS).some(([key, max]) => (data[key]?.length || 0) > max)) throw new Error('blog/too-long');
  if (!title || !text) throw new Error('blog/invalid');
  if (data.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) throw new Error('blog/invalid-slug');
  const reference = existing ? doc(db, 'portfolioPosts', existing.id) : doc(collection(db, 'portfolioPosts'));
  await runTransaction(db, async transaction => {
    if (existing) {
      const current = await transaction.get(reference);
      if (!current.exists()) throw new Error('blog/deleted');
      if (current.data().updatedAt?.toMillis() !== existing.updatedAt?.toMillis()) throw new Error('blog/conflict');
      transaction.update(reference, { ...data, updatedAt: serverTimestamp(), publishedAt: current.data().publishedAt || (status === 'published' ? serverTimestamp() : null) });
    } else {
      transaction.set(reference, { ...data, authorId: user.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: status === 'published' ? serverTimestamp() : null });
    }
    if (status === 'published' && data.tag) transaction.set(doc(db, 'portfolioBlogTopics', 'main'), { tags: arrayUnion(data.tag), updatedAt: serverTimestamp() }, { merge: true });
  });
  return postFromDocument(await getDoc(reference));
}

export async function removePost(existing) {
  if (!navigator.onLine) throw new Error('blog/offline');
  const reference = doc(db, 'portfolioPosts', existing.id);
  await runTransaction(db, async transaction => {
    const current = await transaction.get(reference);
    if (!current.exists()) return;
    if (current.data().updatedAt?.toMillis() !== existing.updatedAt?.toMillis()) throw new Error('blog/conflict');
    transaction.delete(reference);
  });
}
