import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import PostFeed from '../../components/PostFeed';
import { UserContext } from '../../lib/context';
import { firestore, auth, serverTimestamp } from '../../lib/firebase';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';
import { Post as PostType } from '../../lib/types';
import {
  collection,
  doc,
  setDoc,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';

export default function AdminPostsPage(): JSX.Element {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
}

function PostList(): JSX.Element {
  if (!auth.currentUser) {
    return <></>;
  }

  const ref = collection(doc(collection(firestore, 'users'), auth.currentUser.uid), 'posts');
  const q = query(ref, orderBy('createdAt'));
  const [querySnapshot] = useCollection(q);

  const posts: PostType[] | undefined = querySnapshot?.docs.map((doc) => doc.data() as PostType);

  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  );
}

function CreateNewPost(): JSX.Element {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  // Create a new post in firestore
  const createPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;

    // Ensure uid is not undefined before creating the data object
    if (!uid) {
      throw new Error("User is not authenticated");
    }

    const ref = doc(collection(doc(collection(firestore, 'users'), uid), 'posts'), slug);

    // Tip: give all fields a default value here
    const data: PostType = {
      title,
      slug,
      uid,
      username, // username from UserContext
      published: false,
      content: '# hello world!',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      heartCount: 0,
    };

    await setDoc(ref, data);

    toast.success('Post created!')

    // Imperative navigation after doc is set
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
}