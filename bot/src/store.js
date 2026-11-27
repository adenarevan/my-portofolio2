import { arrayUnion, collection, deleteDoc, doc, documentId, getDoc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, setDoc, startAfter, Timestamp, updateDoc, where } from 'firebase/firestore';
export const FieldValue = { serverTimestamp, arrayUnion };
export { Timestamp };
// Preserve the transaction engine while using a worker login subject to Security Rules.
function snapshot(value, store) { return { id: value.id, exists: value.exists(), data: () => value.data(), ref: new Document(store, value.ref) }; }
class Document {
  constructor(store, reference) { this.store = store; this.reference = reference; this.id = reference.id; }
  async get() { return snapshot(await getDoc(this.reference), this.store); }
  set(data) { return setDoc(this.reference, data); }
  update(data) { return updateDoc(this.reference, data); }
  delete() { return deleteDoc(this.reference); }
}
class Collection {
  constructor(store, reference, filters = [], cap = null) { Object.assign(this, { store, reference, filters, cap }); }
  doc(id) { return new Document(this.store, id ? doc(this.reference, id) : doc(this.reference)); }
  select() { return this; } // Client SDK reads complete documents, limited to blog collections.
  where(field, operator, value) { return new Collection(this.store, this.reference, [...this.filters, where(field, operator, value)], this.cap); }
  limit(cap) { return new Collection(this.store, this.reference, this.filters, cap); }
  async get() {
    const docs = []; let cursor = null;
    do {
      const constraints = [...this.filters, orderBy(documentId()), limit(this.cap || 200)];
      if (cursor) constraints.push(startAfter(cursor));
      const page = await getDocs(query(this.reference, ...constraints));
      docs.push(...page.docs.map(value => snapshot(value, this.store)));
      if (this.cap || page.size < 200) break;
      cursor = page.docs.at(-1);
    } while (cursor);
    return { docs, size: docs.length };
  }
}
export class FirestoreStore {
  constructor(firestore) { this.firestore = firestore; }
  collection(path) { return new Collection(this, collection(this.firestore, path)); }
  runTransaction(callback) {
    return runTransaction(this.firestore, transaction => callback({
      get: async reference => snapshot(await transaction.get(reference.reference), this),
      set: (reference, data, options) => options ? transaction.set(reference.reference, data, options) : transaction.set(reference.reference, data),
      // Callers read and check non-existence before create; retries recheck that read.
      create: (reference, data) => transaction.set(reference.reference, data),
      update: (reference, data) => transaction.update(reference.reference, data),
      delete: reference => transaction.delete(reference.reference),
    }));
  }
}
