import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, query, where, limit, getDocs, collection, QueryDocumentSnapshot, DocumentSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Firestore, Timestamp, serverTimestamp as firebaseServerTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const firestore = getFirestore(app) as unknown as Firestore;
export const storage = getStorage(app);

export async function getUserWithUsername(username: string): Promise<QueryDocumentSnapshot | undefined> {
  const usersRef = collection(firestore, 'users');
  const userQuery = query(usersRef, where('username', '==', username), limit(1));
  const userSnapshot = await getDocs(userQuery);
  const userDoc = userSnapshot.docs[0];
  return userDoc;
}

export function postToJSON(doc: DocumentSnapshot | QueryDocumentSnapshot): Record<string, any> {
  if (!doc.exists()) {
    throw new Error('Document does not exist');
  }
  
  const data = doc.data();
  const createdAt = data.createdAt as Timestamp;
  const updatedAt = data.updatedAt as Timestamp;

  return {
    ...data,
    createdAt: createdAt.toMillis(),
    updatedAt: updatedAt.toMillis(),
  };
}

export const serverTimestamp = firebaseServerTimestamp;