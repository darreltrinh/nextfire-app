import React, { ReactNode, useContext } from 'react';
import { UserContext } from '../lib/context';

interface AuthCheckProps {
  children: ReactNode;
  fallback?: React.ReactElement | null;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children, fallback }) => {
  const { username } = useContext(UserContext);

  return username ? (
    <>{children}</>
  ) : (
    fallback || null
  );
};

export default AuthCheck;
