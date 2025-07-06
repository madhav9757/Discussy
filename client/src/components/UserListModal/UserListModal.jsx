// src/components/UserListModal/UserListModal.jsx (Updated)
import React from 'react';
import { Link } from 'react-router-dom';
import './UserListModal.css'; // Your existing CSS

// Helper component for the Follow/Unfollow button
const FollowUnfollowButton = ({
    targetUser,
    currentUserId,
    viewerFollowingIds, // Array of IDs the current user is following
    handleFollow,
    handleUnfollow,
    isLoadingFollow,
    isLoadingUnfollow
}) => {
    // Do not show button if the target user is the current logged-in user
    if (targetUser._id === currentUserId) {
        return null;
    }

    // Determine if the current user (viewer) is already following the targetUser
    const isFollowing = viewerFollowingIds && viewerFollowingIds.includes(targetUser._id);

    const handleClick = () => {
        if (isFollowing) {
            handleUnfollow(targetUser._id);
        } else {
            handleFollow(targetUser._id);
        }
    };

    return (
        <button
            className={`follow-unfollow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
            onClick={handleClick}
            disabled={isLoadingFollow || isLoadingUnfollow}
        >
            {isLoadingFollow || isLoadingUnfollow ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
        </button>
    );
};


const UserListModal = ({
    isOpen,
    onClose,
    title,
    users,
    currentUserId, // ID of the currently logged-in user
    viewerFollowingIds, // Array of IDs that currentUserId is following
    followUser, // RTK Query mutation function
    unfollowUser, // RTK Query mutation function
    isLoadingFollow, // Loading state from follow mutation
    isLoadingUnfollow // Loading state from unfollow mutation
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    {users && users.length > 0 ? (
                        <ul className="modal-list">
                            {users.map((user) => (
                                <li key={user._id} className="modal-list-item">
                                    <img
                                        src={user.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                                        alt={`${user.username} Avatar`}
                                        className="modal-list-avatar"
                                    />
                                    <Link to={`/user/${user._id}`} className="modal-list-link" onClick={onClose}>
                                        {user.username}
                                    </Link>
                                    <FollowUnfollowButton
                                        targetUser={user}
                                        currentUserId={currentUserId}
                                        viewerFollowingIds={viewerFollowingIds}
                                        handleFollow={followUser} // Pass the mutation function directly
                                        handleUnfollow={unfollowUser} // Pass the mutation function directly
                                        isLoadingFollow={isLoadingFollow}
                                        isLoadingUnfollow={isLoadingUnfollow}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="modal-empty-message">No {title.toLowerCase()} to display.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;