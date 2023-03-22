import {
  doc,
  onSnapshot,
  writeBatch,
  increment,
  DocumentReference,
  collection,
  getDoc,
  DocumentSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore, auth, serverTimestamp } from "@/lib/firebase";
import { Post as PostType } from "@/lib/types";

type HeartButtonProps = {
  postRef: DocumentReference<PostType>;
};

export default function HeartButton({ postRef }: HeartButtonProps) {
  const [hearted, setHearted] = useState(false);
  const [heartCount, setHeartCount] = useState(0);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const heartsRef = doc(firestore, `${postRef.path}/hearts/${user.uid}`);
    const unsubscribe = onSnapshot(heartsRef, (doc) => {
      setHearted(doc.exists());
    });

    return unsubscribe;
  }, [postRef, user]);

  useEffect(() => {
    const heartsRef = collection(firestore, `${postRef.path}/hearts`);
    const unsubscribe = onSnapshot(heartsRef, (querySnapshot) => {
      setHeartCount(querySnapshot.size);
    });

    return unsubscribe;
  }, [postRef]);

  const addHeart = async () => {
    const heartsCollectionRef = collection(firestore, `${postRef.path}/hearts`);
    const batch = writeBatch(firestore);

    batch.set(doc(heartsCollectionRef, user?.uid), { uid: user?.uid });
    batch.update(postRef, { heartCount: increment(1) });

    await batch.commit();
  };

  const removeHeart = async () => {
    const heartsCollectionRef = collection(firestore, `${postRef.path}/hearts`);
    const batch = writeBatch(firestore);

    batch.delete(doc(heartsCollectionRef, user?.uid));
    batch.update(postRef, { heartCount: increment(-1) });

    await batch.commit();
  };

  return (
    <button onClick={hearted ? removeHeart : addHeart}>
      {hearted ? "💔 Unheart" : "💗 Heart"}
    </button>
  );
}
