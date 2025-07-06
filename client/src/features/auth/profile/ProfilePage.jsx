// src/pages/ProfilePage/ProfilePage.jsx (Updated)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProfileQuery, useFollowUserMutation, useUnfollowUserMutation } from '../../../app/api/userApi.js';
import UserListModal from '../../../components/UserListModal/UserListModal.jsx';
import './ProfilePage.css';

const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const ProfilePage = () => {
  const { data, isLoading, isError } = useGetProfileQuery(); // This fetches the current user's profile

  // RTK Query Mutations for Follow/Unfollow
  const [followUser, { isLoading: isLoadingFollow }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isLoadingUnfollow }] = useUnfollowUserMutation();

  // State to manage collapsible sections
  const [showCommunities, setShowCommunities] = useState(true);
  const [showPosts, setShowPosts] = useState(true);
  const [showCreatedCommunities, setShowCreatedCommunities] = useState(true);

  // States for modal management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);

  if (isLoading) return <div className="profile-loading">Loading profile...</div>;
  if (isError || !data?._id) {
    return <div className="profile-error">Error loading profile or no user data found.</div>;
  }

  const {
    _id,
    username,
    email,
    createdAt,
    joinedCommunities = [],
    posts = [],
    followers = [],
    following = [], // This is the 'following' list of the *current user*
    createdCommunities = []
  } = data;

  const user = { _id, username, email, createdAt }; // 'user' represents the current profile being viewed

  const totalFollowers = followers.length;
  const totalFollowing = following.length;
  const totalJoinedCommunities = joinedCommunities.length;
  const totalPosts = posts.length;
  const totalCreatedCommunities = createdCommunities.length;

  const registrationDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Handler to open modal
  const openModal = (title, usersList) => {
    // When opening the modal, we need to augment the users in the list
    // with information about whether the *viewer* (current user) is following them.
    const augmentedUsers = usersList.map(u => ({
      ...u,
      // Create a property to indicate if the current user (viewer) is following this 'u'
      viewerFollowingIds: following.map(f => f._id) // Pass the IDs the viewer is following
    }));

    setModalTitle(title);
    setModalUsers(augmentedUsers);
    setIsModalOpen(true);
  };

  // Handler to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalTitle('');
    setModalUsers([]);
  };

  return (
    <div className="github-profile-page-wrapper">
      {/* Left Sidebar */}
      <div className="profile-sidebar">
        <img
          src={user.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
          alt="User Avatar"
          className="sidebar-profile-image"
        />
        <h2 className="sidebar-username">{user.username}</h2>

        <Link to="/profile/edit" className="sidebar-edit-link">
          <button className="sidebar-edit-btn">Edit Profile</button>
        </Link>

        <div className="sidebar-stats">
          {/* Followers - Clickable to open modal */}
          <Link
            to="#"
            className="stat-link"
            onClick={(e) => {
              e.preventDefault();
              openModal('Followers', followers); // Pass the raw followers list
            }}
          >
            <span className="stat-icon">👥</span>
            <span className="stat-text">{totalFollowers} followers</span>
          </Link>
          {/* Following - Clickable to open modal */}
          <Link
            to="#"
            className="stat-link"
            onClick={(e) => {
              e.preventDefault();
              openModal('Following', following); // Pass the raw following list
            }}
          >
            <span className="stat-icon">🚶‍♂️</span>
            <span className="stat-text">{totalFollowing} following</span>
          </Link>
          {/* Communities Joined */}
          <Link to="#" className="stat-link" onClick={(e) => { e.preventDefault(); setShowCommunities(true); }}>
            <span className="stat-icon">🏡</span>
            <span className="stat-text">Joined {totalJoinedCommunities} communities</span>
          </Link>
          {/* Communities Created */}
          <Link to="#" className="stat-link" onClick={(e) => { e.preventDefault(); setShowCreatedCommunities(true); }}>
            <span className="stat-icon">✨</span>
            <span className="stat-text">Created {totalCreatedCommunities} communities</span>
          </Link>
          {/* Posts Created */}
          <Link to="#" className="stat-link" onClick={(e) => { e.preventDefault(); setShowPosts(true); }}>
            <span className="stat-icon">📝</span>
            <span className="stat-text">Created {totalPosts} posts</span>
          </Link>
          {/* Joined Date */}
          <span className="stat-item">
            <span className="stat-icon">📅</span>
            <span className="stat-text">Joined on {registrationDate}</span>
          </span>
        </div>
      </div>

      {/* Right Main Content Area */}
      <div className="profile-main-content">
        {/* Created Communities Section - Collapsible */}
        <div className="content-section">
          <h3 className="section-header" onClick={() => setShowCreatedCommunities(!showCreatedCommunities)}>
            Communities Created ({totalCreatedCommunities})
            <span className={`collapse-icon ${showCreatedCommunities ? 'open' : ''}`}>&#9660;</span>
          </h3>
          <div className={`collapsible-content ${showCreatedCommunities ? 'open' : ''}`}>
            {createdCommunities.length > 0 ? (
              <ul className="content-list">
                {createdCommunities.map((community) => (
                  <li key={community._id} className="content-list-item">
                    <Link to={`/community/${community._id}`} className="content-link">
                      r/{community.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">No communities created yet.</p>
            )}
          </div>
        </div>

        {/* Communities Joined Section - Collapsible */}
        <div className="content-section">
          <h3 className="section-header" onClick={() => setShowCommunities(!showCommunities)}>
            Communities Joined ({totalJoinedCommunities})
            <span className={`collapse-icon ${showCommunities ? 'open' : ''}`}>&#9660;</span>
          </h3>
          <div className={`collapsible-content ${showCommunities ? 'open' : ''}`}>
            {joinedCommunities.length > 0 ? (
              <ul className="content-list">
                {joinedCommunities.map((community) => (
                  <li key={community._id} className="content-list-item">
                    <Link to={`/community/${community._id}`} className="content-link">
                      r/{community.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">Not joined any communities yet.</p>
            )}
          </div>
        </div>

        {/* Posts Section - Collapsible */}
        <div className="content-section">
          <h3 className="section-header" onClick={() => setShowPosts(!showPosts)}>
            My Posts ({totalPosts})
            <span className={`collapse-icon ${showPosts ? 'open' : ''}`}>&#9660;</span>
          </h3>
          <div className={`collapsible-content ${showPosts ? 'open' : ''}`}>
            {posts.length > 0 ? (
              <ul className="content-list">
                {posts.map((post) => (
                  <li key={post._id} className="content-list-item">
                    <Link to={`/posts/${post._id}`} className="content-link">
                      {post.title}
                    </Link>
                    <span className="post-date"> - {formatDateTime(post.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">No posts created yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* User List Modal - Conditionally rendered */}
      <UserListModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        users={modalUsers}
        currentUserId={_id} // Pass the ID of the current user viewing the profile
        followUser={followUser}
        unfollowUser={unfollowUser}
        isLoadingFollow={isLoadingFollow}
        isLoadingUnfollow={isLoadingUnfollow}
      />
    </div>
  );
};

export default ProfilePage;