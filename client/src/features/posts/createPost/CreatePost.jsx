import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreatePostMutation } from '../../../app/api/postsApi.js';
import { useGetCommunityByIdQuery } from '../../../app/api/communitiesApi';
import toast from 'react-hot-toast';
import './createPost.css';

const CreatePost = () => {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [communityId, setCommunityId] = useState(id);

    const { data } = useGetCommunityByIdQuery(id);
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
            navigate(`/community/${communityId}`);
        } catch (error) {
            console.error('Post creation failed:', error);
            toast.error('❌ Failed to create post. Try again.');
        }
    };

    return (
        <div id="create-post-container">
            <div id="post-form-box">
                {data ? (
                    <div id="selected-community-box">
                        <div id="community-header">
                            <span id="community-icon">🎭</span>
                            <div id="community-info">
                                <p id="selected-label">Posting in</p>
                                <strong id="community-name">r/{data.name}</strong>
                                <p id="community-description">{data.description}</p>
                            </div>
                        </div>
                        <a href={`/community/${data._id}`} id="back-to-community-link">
                            ← Back to r/{data.name}
                        </a>
                    </div>
                ) : (
                    <p>Loading community info...</p>
                )}

                <h2 id="form-title">Create New Post</h2>
                <form id="post-form" onSubmit={handleSubmit}>
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
