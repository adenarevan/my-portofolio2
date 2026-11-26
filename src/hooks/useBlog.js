import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { subscribeLatestPosts } from '../lib/blog';

export function useLatestPosts(count = 3) {
  const [state, setState] = useState({ posts: [], loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setState({ posts: [], loading: true, error: false });
    return subscribeLatestPosts(count, posts => setState({ posts, loading: false, error: false }), () => setState({ posts: [], loading: false, error: true }));
  }, [count, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}

export function useBlogSession() {
  const [state, setState] = useState({ user: null, admin: false, loading: Boolean(auth), error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!auth) return;
    let membershipUnsubscribe = () => {};
    const unsubscribe = onAuthStateChanged(auth, user => {
      membershipUnsubscribe();
      if (!user) { setState({ user: null, admin: false, loading: false, error: false }); return; }
      setState({ user, admin: false, loading: true, error: false });
      membershipUnsubscribe = onSnapshot(doc(db, 'portfolioBlogAdmins', user.uid), snapshot => {
        setState({ user, admin: snapshot.exists() && snapshot.data().enabled === true, loading: false, error: false });
      }, error => setState({ user, admin: false, loading: false, error: error.code || 'unknown' }));
    }, error => setState({ user: null, admin: false, loading: false, error: error.code || 'unknown' }));
    return () => { unsubscribe(); membershipUnsubscribe(); };
  }, [attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}
