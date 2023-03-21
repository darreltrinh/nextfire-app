import { createContext } from 'react';
import { User } from 'firebase/auth';

export interface UserContextType {
  user: User | null;
  username: string | null;
  uid: string | null;
}

export const UserContext = createContext<UserContextType>({ user: null, username: null, uid: null });