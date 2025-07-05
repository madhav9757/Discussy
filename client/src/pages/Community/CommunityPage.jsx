import React, { useState } from "react";
import toast from 'react-hot-toast';
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCommunityByIdQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "../../app/api/communitiesApi.js";
import PostCard from '../../components/postCard/PostCard.jsx';
import { useSelector } from "react-redux";
import "./CommunityPage.css";

const CommunityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: community, isLoading, isError } = useGetCommunityByIdQuery(id);
  const { userInfo: user } = useSelector((state) => state.auth);
  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] = useLeaveCommunityMutation();

  const [showMembersModal, setShowMembersModal] = useState(false);

  const currentUserId = user._id;

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isMember = community?.members?.some((member) => member._id === currentUserId) || false;

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        await leaveCommunity(community._id).unwrap();
        toast.success("Left the community");
      } else {
        await joinCommunity(community._id).unwrap();
        toast.success("Joined the community");
      }
    } catch (err) {
      console.error("Failed to join/leave:", err);
      toast.error("Something went wrong");
    }
  };


  const handleCreatePost = () => {
    navigate(`/create-post?communityId=${community._id}`);
  };

  if (isLoading) return <div className="loading">Loading community...</div>;
  if (isError || !community) return <div className="error">Community not found.</div>;

  return (
    <div className="community-page">
      <div className="community-header glass-box">
        <h2>{community.name}</h2>
        <p>{community.description || "No description provided."}</p>
        <div className="creator-date-member-div">
          <p className="creator">
            👤 Created by: <strong>{community?.createdBy?.username || "unknown"}</strong>
          </p>

          <p className="community-created-at">
            🗓️ Created on: {formatDateTime(community.createdAt)}
          </p>

          <p className="members clickable" onClick={() => setShowMembersModal(true)}>
            👥 Members: {community?.members?.length || 0}
          </p>
        </div>
        <div className="community-actions">
          <button
            className={`action-button ${isMember ? "leave" : "join"}`}
            onClick={handleJoinLeave}
            disabled={isJoining || isLeaving}
          >
            {isJoining || isLeaving ? "Processing..." : isMember ? "Leave Community" : "Join Community"}
          </button>

          {isMember && (
            <button className="action-button create-post" onClick={handleCreatePost}>
              ➕ Create Post
            </button>
          )}
        </div>

        <div className="community-posts">
          <h3>Posts in this community</h3>
          {community.posts && community.posts.length > 0 ? (
            <div className="card-grid">
              {community.posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="no-posts">No posts yet in this community.</p>
          )}
        </div>
      </div>

      {showMembersModal && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Members</h3>
            <div className="members-list">
              {community.members.map((member, idx) => {
                const isCreator = member._id === community.createdBy._id;
                const isCurrentUser = member._id === user._id;

                return (
                  <div key={idx} className="member-item">
                    <img
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.username}`}
                      alt="avatar"
                      className="member-avatar"
                    />
                    <div className="member-details">
                      <span className="member-name">
                        {member.username}
                        {isCurrentUser && <span className="you-badge">• you</span>}
                      </span>
                      {isCreator && <span className="role-tag creator">Creator</span>}
                      {!isCreator && <span className="role-tag member">Member</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="modal-close" onClick={() => setShowMembersModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
