import React from 'react';
import './Explore.css';
import { useGetCommunitiesQuery } from '../../app/api/communitiesApi.js';
import { useGetPostsQuery } from '../../app/api/postsApi.js';
import { Flame, Users } from 'lucide-react';
import CommunityCard from '../../components/communitycard/CommunityCard.jsx';
import PostCard from '../../components/postCard/PostCard.jsx'
import { Link } from 'react-router-dom';

const Explore = () => {
  const { data: posts = [] } = useGetPostsQuery();
  const { data: communities = [] } = useGetCommunitiesQuery();

  return (
    <div className="explore-page">
      <h2 className="section-title"><Flame size={22} color="#f87171" /> Trending Posts</h2>
      <div className="card-grid">
        {posts.length > 0 ? posts.map(post => (
          <PostCard key={post._id} post={post} />
        )) : (
          <p className="empty-text">No trending posts yet.</p>
        )}
      </div>

      <h2 className="section-title"><Users size={22} color="#facc15" /> Popular Communities</h2>
      <div className="card-grid">
        {communities.length > 0 ? communities.map(comm => (
          <Link
            key={comm._id}
            to={`/community/${comm._id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <CommunityCard community={comm} />
          </Link>
        )) : (
          <p className="empty-text">No communities created yet.</p>
        )}
      </div>
    </div>
  );
};

export default Explore;
