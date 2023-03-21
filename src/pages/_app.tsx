import '../styles/globals.css'
import { AppProps } from 'next/app';
import { ReactElement } from 'react';
import { UserContext } from '../lib/context';
import Navbar from '../components/Navbar'; // Import your Navbar component
import { Toaster } from 'react-hot-toast'; // Import the Toaster component if you're using an external library
import { useUserData } from '@/lib/hooks';

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  const userData = useUserData();
  return (
    <UserContext.Provider value={userData}>
      <Navbar />
      <Component {...pageProps} />
      <Toaster />
    </UserContext.Provider>
  );
}

export default MyApp;