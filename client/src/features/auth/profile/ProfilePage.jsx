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
import './ProfilePage.css'; // Import the CSS file
import { User, Users, UserPlus, Calendar, Mail, Globe, Lock, Edit, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'; // Import Lucide icons

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

  // Fetch own profile data if it's the user's profile
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    refetch: refetchOwnProfile, // Added refetch for own profile
  } = useGetProfileQuery(undefined, { skip: !isOwnProfile });

  // Fetch other user's data if it's not the user's own profile
  const {
    data: otherUserData,
    isLoading: isLoadingOther,
    isError: isErrorOther,
    refetch: refetchOtherProfile, // Added refetch for other profile
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

  // Refetch data after follow/unfollow to update counts and button state
  React.useEffect(() => {
    if (!isLoadingFollow && !isLoadingUnfollow) {
      if (isOwnProfile) {
        refetchOwnProfile();
      } else {
        refetchOtherProfile();
      }
    }
  }, [isLoadingFollow, isLoadingUnfollow, isOwnProfile, refetchOwnProfile, refetchOtherProfile]);


  if (isLoading) return <div className="profile-loading">Loading profile...</div>;
  if (isError || !data?._id) {
    return <div className="profile-error">Error loading profile or no user data found.</div>;
  }

  const {
    _id,
    username,
    email, // Email is typically not displayed publicly on a profile page
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
        {/* Profile Image with Animated Gradient Border */}
        <div className="sidebar-profile-image">
          <img
            src={image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`}
            alt="User Avatar"
          />
        </div>
        <h2 className="sidebar-username">{username}</h2>
        <span className={`profile-badge ${isPrivate ? 'private' : 'public'}`}>
          {isPrivate ? <Lock size={14} /> : <Globe size={14} />} {isPrivate ? 'Private' : 'Public'}
        </span>

        {bio && <p className="profile-bio">{bio}</p>}

        {/* Conditional Edit/Follow/Unfollow Button */}
        {isOwnProfile ? (
          <Link to="/profile/edit" className="sidebar-edit-link">
            <button className="sidebar-edit-btn">
              <Edit size={16} /> Edit Profile
            </button>
          </Link>
        ) : (
          <button
            className="sidebar-edit-btn" // Reusing button style
            onClick={() => (isFollowing ? unfollowUser(_id) : followUser(_id))}
            disabled={isLoadingFollow || isLoadingUnfollow || !userInfo} // Disable if not logged in
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
            <Users size={18} className="stat-icon" />
            <span className="stat-text">{totalFollowers} followers</span>
          </Link>

          <Link to="#" className="stat-link" onClick={(e) => { e.preventDefault(); openModal('Following', following); }}>
            <UserPlus size={18} className="stat-icon" /> {/* Changed icon for following */}
            <span className="stat-text">{totalFollowing} following</span>
          </Link>

          <span className="stat-item">
            <Calendar size={18} className="stat-icon" />
            <span className="stat-text">Joined on {registrationDate}</span>
          </span>
        </div>
      </div>

      <div className="profile-main-content">
        <div className="profile-tabs-header">
          <button className={activeTab === 'created' ? 'active-tab' : ''} onClick={() => setActiveTab('created')}>
            Created Communities ({createdCommunities.length})
          </button>
          <button className={activeTab === 'joined' ? 'active-tab' : ''} onClick={() => setActiveTab('joined')}>
            Joined Communities ({joinedCommunities.length})
          </button>
          <button className={activeTab === 'posts' ? 'active-tab' : ''} onClick={() => setActiveTab('posts')}>
            My Posts ({posts.length})
          </button>
        </div>

        <div className="tab-content">
          {isLoading ? ( // Show skeleton loader if data is still loading
            <>
              <div className="skeleton-item" style={{ height: '40px', width: '80%' }}></div>
              <div className="skeleton-item" style={{ height: '40px', width: '90%' }}></div>
              <div className="skeleton-item" style={{ height: '40px', width: '70%' }}></div>
            </>
          ) : (
            <>
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
            </>
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
