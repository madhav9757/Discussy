// src/pages/createcommunitypage/CreateCommunityPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCommunityMutation } from '../../../app/api/communitiesApi'; // Adjust path as needed
import Loader from '../../../components/loader/loader'; // Assuming you have a Loader component
import './CreateCommunityPage.css'; // We'll create this CSS file next

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Destructure the mutation function and its state from the hook
  const [createCommunity, { isLoading, isSuccess, isError, error }] = useCreateCommunityMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      alert('Community name cannot be empty.');
      return;
    }

    try {
      // Call the mutation
      // The `name` is required by your `createCommunity` endpoint.
      // We can extend the API to accept description and category later if needed.
      // For now, only 'name' is directly sent as per communitiesApi.js provided.
      await createCommunity({ name, description, category }).unwrap();
      // If successful, navigate back to communities or to the new community's page
      navigate('/community'); // Navigate back to the communities list
      // Or if you have a specific route for a new community:
      // navigate(`/community/${result._id}`); // Requires API to return _id

    } catch (err) {
      console.error('Failed to create community:', err);
      // Error state will be handled by `isError` and `error`
    }
  };

  // Provide user feedback
  if (isLoading) {
    return (
      <div className="create-community-page-container">
        <Loader />
        <p>Creating community...</p>
      </div>
    );
  }

  return (
    <div className="create-community-page-container">
      <div className="create-community-card">
        <h2>Create a New Community</h2>
        <form onSubmit={handleSubmit} className="create-community-form">
          <div className="form-group">
            <label htmlFor="communityName">Community Name:</label>
            <input
              type="text"
              id="communityName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., r/MyAwesomeCommunity"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="communityCategory">Category:</label>
            <select
              id="communityCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a Category</option>
              <option value="tech">Tech</option>
              <option value="gaming">Gaming</option>
              <option value="education">Education</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="news">News</option>
              <option value="sports">Sports</option>
              <option value="art">Art</option>
              {/* Add more categories as needed */}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="communityDescription">Description (Optional):</label>
            <textarea
              id="communityDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Tell us what your community is about..."
            ></textarea>
          </div>

          {isSuccess && <p className="success-message">Community created successfully!</p>}
          {isError && <p className="error-message">Error: {error?.data?.message || 'Failed to create community.'}</p>}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            Create Community
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityPage;