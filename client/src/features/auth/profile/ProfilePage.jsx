import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetProfileQuery,
  useGetUserByIdQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '../../../app/api/userApi.js';
import UserListModal from '../../../components/UserListModal/UserListModal.jsx';
import './ProfilePage.css';

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const ProfilePage = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const isOwnProfile = !id || id === userInfo?._id;

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
  } = useGetProfileQuery(undefined, { skip: !isOwnProfile });
  console.log(profileData);

  const {
    data: otherUserData,
    isLoading: isLoadingOther,
    isError: isErrorOther,
  } = useGetUserByIdQuery(id, { skip: isOwnProfile });

  const data = isOwnProfile ? profileData : otherUserData;
  const isLoading = isOwnProfile ? isLoadingProfile : isLoadingOther;
  const isError = isOwnProfile ? isErrorProfile : isErrorOther;

  const [followUser, { isLoading: isLoadingFollow }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isLoadingUnfollow }] = useUnfollowUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('created');

  if (isLoading) return <div className="profile-loading">Loading profile...</div>;
  if (isError || !data?._id) {
    return <div className="profile-error">Error loading profile or no user data found.</div>;
  }

  const {
    _id,
    username,
    email,
    image,
    bio,
    isPrivate,
    createdAt,
    joinedCommunities = [],
    posts = [],
    followers = [],
    following = [],
    createdCommunities = [],
  } = data;

  const totalFollowers = followers.length;
  const totalFollowing = following.length;
  const registrationDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const openModal = (title, usersList) => {
    setModalTitle(title);
    setModalUsers(usersList);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalTitle('');
    setModalUsers([]);
  };

  const isFollowing = followers.some((f) => f._id === userInfo?._id);

  return (
    <div className="github-profile-page-wrapper">
      <div className="profile-sidebar">
        <img
          src={image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`}
          alt="User Avatar"
          className="sidebar-profile-image"
        />
        <h2 className="sidebar-username">{username}</h2>
        <span className={`profile-badge ${isPrivate ? 'private' : 'public'}`}>
          {isPrivate ? '🔒 Private' : '🌐 Public'}
        </span>

        {bio && <p className="profile-bio">{bio}</p>}

        {isOwnProfile ? (
          <Link to="/profile/edit" className="sidebar-edit-link">
            <button className="sidebar-edit-btn">Edit Profile</button>
          </Link>
        ) : (
          <button
            className="sidebar-edit-btn"
            onClick={() => (isFollowing ? unfollowUser(_id) : followUser(_id))}
            disabled={isLoadingFollow || isLoadingUnfollow}
          >
            {isLoadingFollow || isLoadingUnfollow
              ? '...'
              : isFollowing
              ? 'Unfollow'
              : 'Follow'}
          </button>
        )}

        <div className="sidebar-stats">
          <Link to="#" className="stat-link" onClick={(e) => { e.preventDefault(); openModal('Followers', followers); }}>
            <span className="stat-icon">👥</span>
            <span className="stat-text">{totalFollowers} followers</span>
          </Link>

          <Link to="#" className="stat-link" onClick={(e) => { e.preventDefault(); openModal('Following', following); }}>
            <span className="stat-icon">🚶‍♂️</span>
            <span className="stat-text">{totalFollowing} following</span>
          </Link>

          <span className="stat-item">
            <span className="stat-icon">📅</span>
            <span className="stat-text">Joined on {registrationDate}</span>
          </span>
        </div>
      </div>

      <div className="profile-main-content">
        <div className="profile-tabs-header">
          <button className={activeTab === 'created' ? 'active-tab' : ''} onClick={() => setActiveTab('created')}>
            Created Communities
          </button>
          <button className={activeTab === 'joined' ? 'active-tab' : ''} onClick={() => setActiveTab('joined')}>
            Joined Communities
          </button>
          <button className={activeTab === 'posts' ? 'active-tab' : ''} onClick={() => setActiveTab('posts')}>
            My Posts
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'created' && (
            createdCommunities.length > 0 ? (
              <ul className="content-list">
                {createdCommunities.map((c) => (
                  <li key={c._id}><Link to={`/community/${c._id}`}>r/{c.name}</Link></li>
                ))}
              </ul>
            ) : <p>No communities created yet.</p>
          )}

          {activeTab === 'joined' && (
            joinedCommunities.length > 0 ? (
              <ul className="content-list">
                {joinedCommunities.map((c) => (
                  <li key={c._id}><Link to={`/community/${c._id}`}>r/{c.name}</Link></li>
                ))}
              </ul>
            ) : <p>Not joined any communities yet.</p>
          )}

          {activeTab === 'posts' && (
            posts.length > 0 ? (
              <ul className="content-list">
                {posts.map((post) => (
                  <li key={post._id}>
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                    <span className="post-date"> - {formatDateTime(post.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : <p>No posts created yet.</p>
          )}
        </div>
      </div>

      <UserListModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        users={modalUsers}
        currentUserId={userInfo?._id}
        viewerFollowingIds={userInfo?.following?.map((f) => f._id) || []}
        followUser={followUser}
        unfollowUser={unfollowUser}
        isLoadingFollow={isLoadingFollow}
        isLoadingUnfollow={isLoadingUnfollow}
      />
    </div>
  );
};

export default ProfilePage;
