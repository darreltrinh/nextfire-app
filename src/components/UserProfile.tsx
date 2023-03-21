import React from 'react';

// Create a type for the user prop
type UserProfileProps = {
  user: {
    photoURL: string | null;
    username: string | null;
    displayName: string | null;
    uid: string;
  };
};

// Update the functional component to use the UserProfileProps type
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div className="box-center">
      <img src={user.photoURL || '/hacker.png'} className="card-img-center" />
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName || 'Anonymous User'}</h1>
      <p>{user.uid}</p>
    </div>
  );
};

export default UserProfile;
