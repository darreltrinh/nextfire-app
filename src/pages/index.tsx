import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import PostFeed from '@/components/PostFeed';
import { Post as PostType } from '@/lib/types';
import Loader from '@/components/Loader';
import { firestore, postToJSON } from '@/lib/firebase';
import { Timestamp, collectionGroup, startAfter, getDocs, limit, orderBy, where, query as firestoreQuery, serverTimestamp } from 'firebase/firestore';


// Max post to query per page
const LIMIT = 1;

type HomeProps = {
  posts: PostType[] | null;
};

export const getServerSideProps: GetServerSideProps = async () => {
  const postsRef = collectionGroup(firestore, 'posts');
  const postsQuery = firestoreQuery(postsRef, where('published', '==', true), orderBy('createdAt', 'desc'), limit(LIMIT));
  const postsSnapshot = await getDocs(postsQuery);
  const posts = postsSnapshot.docs.map(postToJSON);

  return {
    props: { posts },
  };
};

const Home: React.FC<HomeProps> = ({ posts: initialPosts }) => {
  const [posts, setPosts] = useState<PostType[]>(initialPosts || []);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);

    if (posts.length === 0) {
      setLoading(false);
      return;
    }
  

    const last = posts[posts.length - 1];
  
    const cursor =
      typeof last.createdAt === 'number' ? Timestamp.fromMillis(last.createdAt) : serverTimestamp();
  
    const postsRef = collectionGroup(firestore, 'posts');
    const q = firestoreQuery(
      postsRef,
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      startAfter(cursor),
      limit(LIMIT)
    );
  
    const newPostsSnapshot = await getDocs(q);
    const newPosts = newPostsSnapshot.docs.map(postToJSON) as PostType[]; // Convert the documents to the Post type
  
    setPosts(posts.concat(newPosts));
    setLoading(false);
  
    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  );
};

export default Home;
