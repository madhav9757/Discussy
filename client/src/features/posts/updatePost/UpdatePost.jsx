import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    useGetPostByIdQuery,
    useUpdatePostMutation,
} from "../../../app/api/postsApi.js";
import { useGetCommunityByIdQuery } from "../../../app/api/communitiesApi.js";
import "./UpdatePost.css";

const EditPostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: post, isLoading: postLoading } = useGetPostByIdQuery(id);
    const [updatePost] = useUpdatePostMutation();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // Get community data for banner
    const communityId = post?.community?._id;
    const { data: community } = useGetCommunityByIdQuery(communityId, {
        skip: !communityId,
    });

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
        }
    }, [post]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updatePost({ id, title, content }).unwrap();
            toast.success("✅ Post updated successfully!");
            navigate(`/posts/${id}`);
        } catch (err) {
            console.error(err);
            toast.error("❌ Failed to update post.");
        }
    };

    if (postLoading || !post) return <p className="loading">Loading post...</p>;

    return (
        <div id="edit-post-container">
            <div id="edit-post-box">
                {community && (
                    <div id="community-banner">
                        <p className="posting-label">Editing in</p>
                        <div className="community-info">
                            <img
                                src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${community.name}`}
                                alt="avatar"
                                className="community-avatar"
                            />
                            <div>
                                <h4 className="community-name">r/{community.name}</h4>
                                <p className="community-description">{community.description}</p>
                            </div>
                        </div>
                        <Link to={`/community/${community._id}`} className="back-link">
                            ← Back to r/{community.name}
                        </Link>
                    </div>
                )}

                <h2>Edit Post</h2>
                <form id="edit-post-form" onSubmit={handleUpdate}>
                    <input
                        type="text"
                        value={title}
                        placeholder="Post title"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        value={content}
                        placeholder="Post content (optional)"
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button type="submit" disabled={postLoading}>
                        {postLoading ? "Updating..." : "Update Post"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditPostPage;
