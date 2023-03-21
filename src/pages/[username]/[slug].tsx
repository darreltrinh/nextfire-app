import styles from '@/styles/Admin.module.css';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { getUserWithUsername, postToJSON } from '../../lib/firebase';
import { firestore } from '../../lib/firebase';
import { collection, collectionGroup, doc as firebaseDoc, getDocs, getDoc, DocumentReference } from 'firebase/firestore';
import { Post as PostType } from '@/lib/types';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import PostContent from '@/components/PostContent';
import HeartButton from '@/components/HeartButton';
import AuthCheck from '@/components/AuthCheck';

interface PostPageParams extends ParsedUrlQuery {
  username: string;
  slug: string;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { username, slug } = params as PostPageParams;
  const userDoc = await getUserWithUsername(username);

  let post: PostType | null = null;
  let path: string | null = null;

  if (userDoc) {
    const postRef = firebaseDoc(collection(userDoc.ref, 'posts'), slug);
    const postData = await getDoc(postRef);
    post = postToJSON(postData) as PostType;

    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const snapshot = await getDocs(collectionGroup(firestore, 'posts'));

  const paths = snapshot.docs.flatMap((doc) => {
    const { slug, username } = doc.data() as PostType;
    if (username && slug) {
      return [
        {
          params: { username: String(username), slug: String(slug) },
        },
      ];
    } else {
      return [];
    }
  });

  return {
    paths,
    fallback: 'blocking',
  };
};


interface PostProps {
  post: PostType;
  path: string | null;
}

const Post: React.FC<PostProps> = ({ post, path }) => {
  const postRef = firebaseDoc(firestore, path!) as DocumentReference<PostType>;
  const [realtimePost] = useDocumentData<PostType>(postRef);

  const postContent = realtimePost || post;

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={postContent} />
      </section>
      <aside className="card">
        <p>
          <strong>{postContent.heartCount || 0} 🤍</strong>
        </p>
        <AuthCheck fallback={<Link href="/enter" passHref><button>You must be signed in to heart posts.</button></Link>}>

          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
};

interface PostPageProps {
  post: PostType | null;
  path: string | null;
}

const PostPage: React.FC<PostPageProps> = ({ post, path }) => {
  if (!post || !path) {
    return <div>Loading...</div>;
  }

  return <Post post={post} path={path} />;
};

export default PostPage;
