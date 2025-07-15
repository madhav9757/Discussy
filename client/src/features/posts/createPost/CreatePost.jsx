import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCreatePostMutation } from '../../../app/api/postsApi.js';
import { useGetCommunityByIdQuery } from '../../../app/api/communitiesApi';
import { useGetCommunitiesQuery } from '../../../app/api/communitiesApi';
import toast from 'react-hot-toast';
import './createPost.css';

const CreatePost = () => {
    const { id } = useParams();
    const location = useLocation();
    const isGeneralPost = location.pathname === '/new-post';
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [communityId, setCommunityId] = useState(id || '');

    const { data: community } = useGetCommunityByIdQuery(id, { skip: !id });
    const { data: communities = [] } = useGetCommunitiesQuery(undefined, { skip: !isGeneralPost });
    const [createPost, { isLoading }] = useCreatePostMutation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !communityId) {
            toast.error('Please enter a title.');
            return;
        }

        try {
            await createPost({ title, content, community: communityId }).unwrap();
            toast.success('✅ Post created successfully!');
            if (communityId) {
                navigate(`/community/${communityId}`);
            } else {
                navigate('/explore');
            }
        } catch (error) {
            console.error('Post creation failed:', error);
            toast.error('❌ Failed to create post. Try again.');
        }
    };

    return (
        <div id="create-post-container">
            <div id="post-form-box">
                {isGeneralPost ? (
                    <div id="general-post-header">
                        <h2 id="form-title">Create New Post</h2>
                        <p>Share your thoughts with the community</p>
                    </div>
                ) : community ? (
                    <div id="selected-community-box">
                        <div id="community-header">
                            <span id="community-icon">🎭</span>
                            <div id="community-info">
                                <p id="selected-label">Posting in</p>
                                <strong id="community-name">r/{community.name}</strong>
                                <p id="community-description">{community.description}</p>
                            </div>
                        </div>
                        <a href={`/community/${community._id}`} id="back-to-community-link">
                            ← Back to r/{community.name}
                        </a>
                    </div>
                ) : (
                    <p>Loading community info...</p>
                )}

                {!isGeneralPost && <h2 id="form-title">Create New Post</h2>}
                <form id="post-form" onSubmit={handleSubmit}>
                    {isGeneralPost && (
                        <select
                            value={communityId}
                            onChange={(e) => setCommunityId(e.target.value)}
                            required
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                border: '1px solid #3a3a3a',
                                backgroundColor: '#2a2a2a',
                                color: '#e0e0e0',
                                marginBottom: '1rem',
                                width: '100%'
                            }}
                        >
                            <option value="">Select a community</option>
                            {communities.map((comm) => (
                                <option key={comm._id} value={comm._id}>
                                    r/{comm.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <input
                        type="text"
                        placeholder="Post title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <textarea
                        placeholder="Post content (optional)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <button type="submit" id="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
