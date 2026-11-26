import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, runTransaction, serverTimestamp, startAfter, where } from 'firebase/firestore';
import { db } from './firebase';
import { bodyText } from './richText';

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

export async function loadPublishedPosts(cursor = null) {
  if (!db) return { posts: [], cursor: null, hasMore: false };
  const constraints = [where('status', '==', 'published'), orderBy('publishedAt', 'desc')];
  if (cursor) constraints.push(startAfter(cursor));
  const snapshot = await getDocs(query(collection(db, 'portfolioPosts'), ...constraints, limit(9)));
  return { posts: snapshot.docs.map(postFromDocument), cursor: snapshot.docs.at(-1) || null, hasMore: snapshot.size === 9 };
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
