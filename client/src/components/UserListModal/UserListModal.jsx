import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './UserListModal.css';

const FollowUnfollowButton = ({
    targetUser,
    currentUserId,
    viewerFollowingIds,
    handleFollow,
    handleUnfollow,
    isLoadingFollow,
    isLoadingUnfollow
}) => {
    if (targetUser._id === currentUserId) return null;
    const isFollowing = viewerFollowingIds?.includes(targetUser._id);
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
            {isLoadingFollow || isLoadingUnfollow ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
        </button>
    );
};

const UserListModal = ({
    isOpen,
    onClose,
    title,
    users,
    currentUserId,
    viewerFollowingIds,
    followUser,
    unfollowUser,
    isLoadingFollow,
    isLoadingUnfollow
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
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
                                            <Link
                                                to={`/user/${user._id}`}
                                                className="modal-list-link"
                                                onClick={onClose}
                                            >
                                                {user.username}
                                                {user._id === currentUserId && <span className="badge you">You</span>}
                                                {user.isCreator && <span className="badge creator">Creator</span>}
                                            </Link>
                                            <FollowUnfollowButton
                                                targetUser={user}
                                                currentUserId={currentUserId}
                                                viewerFollowingIds={viewerFollowingIds}
                                                handleFollow={followUser}
                                                handleUnfollow={unfollowUser}
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
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserListModal;
