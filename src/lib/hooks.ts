import { auth } from '../lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User } from 'firebase/auth';
import { firestore } from '../lib/firebase';

// Custom hook to read auth record and user profile doc
export function useUserData(): { user: User | null; username: string | null; uid: string | null } {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Turn off realtime subscription
    let unsubscribe: (() => void) | undefined;

    if (user) {
      const ref = doc(collection(firestore, 'users'), user.uid);
      unsubscribe = onSnapshot(ref, (doc) => {
        setUsername(doc.data()?.username || null);
      });
    } else {
      setUsername(null);
    }

    return unsubscribe;
  }, [user]);

  return { user: user || null, username, uid: user?.uid || null };
}
