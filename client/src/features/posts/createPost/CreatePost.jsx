import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [communityId, setCommunityId] = useState('');
    const [communities, setCommunities] = useState([]);

    useEffect(() => {
        axios.get('/api/communities').then((res) => setCommunities(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post(
            '/api/posts',
            { title, body, communityId },
            { withCredentials: true }
        );
        alert('Post created!');
    };

    return (
        <form onSubmit={handleSubmit} className="create-post-form">
            <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} required>
                <option value="">Select Community</option>
                {communities.map((com) => (
                    <option key={com._id} value={com._id}>
                        r/{com.name}
                    </option>
                ))}
            </select>

            <input
                type="text"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <textarea
                placeholder="Post body (optional)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
            ></textarea>

            <button type="submit">Submit</button>
        </form>
    );
};

export default CreatePost;
