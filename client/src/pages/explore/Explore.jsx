import React from 'react';
import './Explore.css';
import { useGetCommunitiesQuery } from '../../app/api/communitiesApi.js';
import { useGetPostsQuery } from '../../app/api/postsApi.js';
import { Flame, Users } from 'lucide-react';
import CommunityCard from '../../components/communitycard/CommunityCard.jsx';
import PostCard from '../../components/postCard/PostCard.jsx'
// import { Link } from 'react-router-dom'; // Remove Link import here if not used elsewhere

const Explore = () => {
  const { data: posts = [], isLoading: isLoadingPosts, isError: isErrorPosts } = useGetPostsQuery();
  const { data: communities = [], isLoading: isLoadingCommunities, isError: isErrorCommunities } = useGetCommunitiesQuery();

  return (
    <div className="explore-page">
      <h2 className="section-title"><Flame size={22} color="#f87171" /> Trending Posts</h2>
      <div className="card-grid">
        {isLoadingPosts ? (
          <p className="loading-text">Loading trending posts...</p>
        ) : isErrorPosts ? (
          <p className="error-text">Failed to load trending posts.</p>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        ) : (
          <p className="empty-text">No trending posts yet.</p>
        )}
      </div>

      <h2 className="section-title"><Users size={22} color="#facc15" /> Popular Communities</h2>
      <div className="card-grid">
        {isLoadingCommunities ? (
          <p className="loading-text">Loading popular communities...</p>
        ) : isErrorCommunities ? (
          <p className="error-text">Failed to load popular communities.</p>
        ) : communities.length > 0 ? (
          communities.map(comm => (
            // Removed the <Link> component here
            <CommunityCard key={comm._id} community={comm} />
          ))
        ) : (
          <p className="empty-text">No communities created yet.</p>
        )}
      </div>
    </div>
  );
};

export default Explore;