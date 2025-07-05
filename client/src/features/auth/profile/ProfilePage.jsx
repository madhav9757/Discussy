import React from 'react';
import { useSelector } from 'react-redux';
import './ProfilePage.css';

const ProfilePage = () => {
  const { userInfo: user } = useSelector((state) => state.auth);

  console.log('userInfo:', user)
  if (!user) return <p>Loading or not logged in...</p>;

  return (
    <div className="profile-container">
      <img
        src={user.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
        alt="User Avatar"
        className="profile-image"
      />
      <h2>{user.user.username}</h2>
      <p>Email: {user.user.email}</p>
      {/* You can add more like: bio, createdAt, community count, etc. */}
    </div>
  );
};

export default ProfilePage;
