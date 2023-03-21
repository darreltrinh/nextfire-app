import { Timestamp } from '@firebase/firestore-types';


export type Post = {
    uid: string | null;
    slug: string;
    username: string | null;
    title: string;
    content: string;
    heartCount: number | null;
    published: boolean;
    createdAt: number | Timestamp;
    updatedAt: number | Timestamp;
  };

