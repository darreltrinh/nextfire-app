import styles from "@/styles/Admin.module.css"
import AuthCheck from "../../components/AuthCheck";
import { firestore, auth, serverTimestamp } from "../../lib/firebase";
import ImageUploader from "@/components/ImageUpload";
import { useState } from "react";
import { useRouter } from "next/router";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import toast from "react-hot-toast";
import { Post as PostType } from "@/lib/types";
import {
  doc,
  updateDoc,
  Timestamp,
  collection,
  DocumentReference,
  FirestoreDataConverter,
} from "firebase/firestore";

export default function AdminPostEdit(): JSX.Element {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

const postConverter: FirestoreDataConverter<PostType> = {
  toFirestore: (post: PostType) => post,
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      uid: data.uid || null,
      username: data.username || null,
      heartCount: data.heartCount || null,
    } as PostType;
  },
};

function PostManager(): JSX.Element {
  if (!auth.currentUser) {
    return <></>;
  }
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = doc(
    collection(
      doc(collection(firestore, "users"), auth.currentUser.uid as string),
      "posts"
    ),
    slug as string
  ).withConverter(postConverter);
  
  // Moved outside the if statement
  const [post] = useDocumentData<PostType>(postRef);

  if (!post) {
    return <p>Loading...</p>;
  }

  return (
    <main className= {styles.container}>
      <section>
        <h1>{post.title}</h1>
        <p>ID: {post.slug}</p>

        <PostForm
          postRef={postRef}
          defaultValues={post}
          preview={preview}
        />
      </section>

      <aside>
        <h3>Tools</h3>
        <button onClick={() => setPreview(!preview)}>
          {preview ? "Edit" : "Preview"}
        </button>
        <Link href={`/${post.username}/${post.slug}`}>
          <button className="btn-blue">Live view</button>
        </Link>
      </aside>
    </main>
  );
}

type PostFormProps = {
  defaultValues: PostType;
  postRef: DocumentReference<PostType>;
  preview: boolean;
};

function PostForm({
  defaultValues,
  postRef,
  preview,
}: PostFormProps): JSX.Element {
  const { register, handleSubmit, reset, watch } = useForm<PostType>({
    defaultValues,
    mode: "onChange",
  });

  const updatePost = async ({ content, published }: PostType) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp() as Timestamp,
    });

    reset({ content, published });

    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register("content", {
            maxLength: { value: 20000, message: "content is too long" },
            minLength: { value: 10, message: "content is too short" },
            required: { value: true, message: "content is required" },
          })}
        />

        <fieldset>
          <input
            className={styles.checkbox}
            {...register("published")}
            type="checkbox"
          />
          <label>Published</label>
        </fieldset>

        <button type="submit" className="btn-green">
          Save Changes
        </button>
      </div>
    </form>
  );
}
