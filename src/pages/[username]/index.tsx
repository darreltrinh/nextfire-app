import React from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getUserWithUsername, postToJSON } from '../../lib/firebase';
import UserProfile from '../../components/UserProfile';
import PostFeed from '../../components/PostFeed';
import {
  collection,
  query as firestoreQuery,
  where,
  orderBy,
  limit,
  getDocs,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ParsedUrlQuery } from 'querystring';

interface UsernamePageParams extends ParsedUrlQuery {
  username: string;
}

interface User {
  username: string;
  displayName: string | null;
  photoURL: string | null;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { username } = query as UsernamePageParams;
  const userDoc = await getUserWithUsername(username);

  let user: User | null = null;
  let posts = null;

  if (userDoc) {
    const userData = userDoc.data();
    user = {
      username: userData.username,
      displayName: userData.displayName,
      photoURL: userData.photoURL?.toString() ?? null,
    };

    const postsRef = collection(userDoc.ref, 'posts');
    const postsQuery = firestoreQuery(
      postsRef,
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const postsSnapshot = await getDocs(postsQuery);
    posts = postsSnapshot.docs.map((doc: QueryDocumentSnapshot) => postToJSON(doc));
  }

  return {
    props: { user, posts },
  };
};

const UserProfilePage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  user,
  posts,
}) => {
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
};

export default UserProfilePage;
