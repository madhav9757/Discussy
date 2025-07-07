import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
} from '../../../../app/api/userApi.js';
import { toast } from 'react-toastify';
import './UpdateProfile.css';

const UpdateProfile = () => {
    const navigate = useNavigate();

    const {
        data: userProfile,
        isLoading,
        isError,
        error,
    } = useGetProfileQuery();

    const [
        updateProfile,
        {
            isLoading: isUpdating,
            isSuccess,
            isError: isUpdateError,
            error: updateError,
        },
    ] = useUpdateProfileMutation();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (userProfile) {
            setUsername(userProfile.username || '');
            setEmail(userProfile.email || '');
        }
    }, [userProfile]);

    useEffect(() => {
        if (isSuccess) {
            toast.success('🎉 Profile updated successfully!');
            navigate('/profile');
        }
    }, [isSuccess, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const updatedFields = { username, email };
            await updateProfile(updatedFields).unwrap();
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    const isModified =
        username !== (userProfile?.username || '') ||
        email !== (userProfile?.email || '');

    if (isLoading) {
        return (
            <div className="update-profile-message">Loading profile data...</div>
        );
    }

    if (isError) {
        return (
            <div className="update-profile-message error">
                Error loading profile:{' '}
                {error?.data?.message || error?.message || 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="update-profile-container">
            <h1 className="update-profile-title">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="update-profile-form">
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-input"
                        disabled={isUpdating}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        disabled={isUpdating}
                    />
                </div>

                <button
                    type="submit"
                    className="update-profile-btn"
                    disabled={!isModified || isUpdating}
                >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>

                <button
                    type="button"
                    className="update-profile-btn cancel"
                    onClick={() => navigate('/profile')}
                >
                    Cancel
                </button>

                {isUpdateError && (
                    <div className="update-profile-error-message">
                        Failed to update:{' '}
                        {updateError?.data?.message ||
                            updateError?.message ||
                            'Please try again.'}
                    </div>
                )}
            </form>
        </div>
    );
};

export default UpdateProfile;
