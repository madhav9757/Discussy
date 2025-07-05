import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreatePostMutation } from '../../../app/api/postsApi.js';
import { useGetCommunitiesQuery, useGetCommunityByIdQuery } from '../../../app/api/communitiesApi';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import './CreatePost.css';

const CreatePost = () => {
    const [searchParams] = useSearchParams();
    const preselectedCommunityId = searchParams.get('communityId');
    const {communityId: id} = useParams();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [communityId, setCommunityId] = useState(preselectedCommunityId || '');

    const { data: communities = [], isLoading: loadingCommunities } = useGetCommunitiesQuery();
    const [createPost, { isLoading }] = useCreatePostMutation();
    const navigate = useNavigate();

    const findedCommunity = use

    const handleSelectCommunity = (e) => {
        setCommunityId(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !communityId) {
            toast.error('Please select a community and enter a title.');
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
        <div className="create-post-container">
            <div className="post-form-box">
                <h2>Create New Post</h2>
                <form className="post-form" onSubmit={handleSubmit}>
                    <select value={communityId} onChange={handleSelectCommunity}>
                        <option value="">Select Community</option>
                        {communities.map((c) => (
                            <option key={c._id} value={c._id}>
                                r/{c.name}
                            </option>
                        ))}
                    </select>

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

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
