import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Post } from '@/lib/types';
import { useEffect, useState } from 'react';

interface PostContentProps {
  post: Post | null;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (post?.createdAt) {
      const createdAt =
        typeof post.createdAt === 'number'
          ? new Date(post.createdAt)
          : post.createdAt.toDate();
      setFormattedDate(
        new Intl.DateTimeFormat('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
        }).format(createdAt)
      );
    }
  }, [post]);

  return (
    <div className="card">
      <h1>{post?.title}</h1>
      <span className="text-sm">
        Written by{' '}
        <Link href={`/${post?.username}/`} passHref>
          <span className="text-info cursor-pointer">@{post?.username}</span>
        </Link>{' '}
        on {formattedDate}
      </span>
      <ReactMarkdown>{post?.content ?? ''}</ReactMarkdown>
    </div>
  );
};

export default PostContent;
