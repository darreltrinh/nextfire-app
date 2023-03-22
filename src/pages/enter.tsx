import Head from 'next/head';
import { useContext, useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { auth, firestore, googleAuthProvider } from '@/lib/firebase';
import { UserContext } from '@/lib/context';
import Loader from '@/components/Loader';

interface MetatagsProps {
  title: string;
  description: string;
}

interface UsernameMessageProps {
  username: string;
  isValid: boolean;
  loading: boolean;
}

export default function Enter(): React.ReactNode {
  const { user, username } = useContext(UserContext);

  return (
    <main>
      <Metatags title="wavey blogs" description="for baddies only!" />
      {user ? !username ? <UsernameForm /> : <SignOutButton /> : <SignInButton />}
    </main>
  );
}

function Metatags({ title, description }: MetatagsProps): JSX.Element {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
  );
}


function SignInButton(): JSX.Element {
  const signInWithGoogle = async () => {
    try {
    await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={'/google.png'} width="30px" /> Sign in with Google
    </button>
  );
}

function SignOutButton(): JSX.Element | null {
  return <button onClick={() => signOut(auth)}>Sign Out</button>;
}

function UsernameForm(): JSX.Element | null {
  const [formValue, setFormValue] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingUser, setCheckingUser] = useState<boolean>(true);

  const { user, username } = useContext(UserContext);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
  
      const userDoc = doc(firestore, `users/${user.uid}`);
      const userDocSnapshot = await getDoc(userDoc);
  
      if (userDocSnapshot.exists()) {
        setCheckingUser(false);
      } else {
        setCheckingUser(false);
      }
    };
  
    fetchUser();
  }, [user]);
  

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!user) return;
  
    const userDoc = doc(firestore, `users/${user.uid}`);
    const usernameDoc = doc(firestore, `usernames/${formValue}`);
  
    const batchWrite = writeBatch(firestore);
    batchWrite.set(userDoc, {
      username: formValue,
      photoURL: user.photoURL ?? null,
      displayName: user.displayName ?? null,
    });
    batchWrite.set(usernameDoc, { uid: user.uid });
  
    await batchWrite.commit();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length >= 3) {
        const ref = doc(firestore, `usernames/${username}`);
        const docSnapshot = await getDoc(ref);
        console.log('Firestore read executed!');
        setIsValid(!docSnapshot.exists());
        setLoading(false);
      }
    }, 500),
    []
  );
  
  return (
    !username && !checkingUser ? (
      <section>
        <h3>Choose Username</h3>
        <form onSubmit={onSubmit}>
          <input name="username" placeholder="myname" value={formValue} onChange={onChange} />
          <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
          <button type="submit" className="btn-green" disabled={!isValid}>
            Choose
          </button>
  
          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    ) : checkingUser ? (
      <Loader show={checkingUser} />
    ) : null
  );
}  

function UsernameMessage({ username, isValid, loading }: UsernameMessageProps): JSX.Element {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}
