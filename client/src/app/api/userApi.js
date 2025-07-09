import { discusslyApi } from "./discusslyApi";
import { USER_API_URL } from "../constant";

const extendedApi = discusslyApi.injectEndpoints({
    endpoints: (builder) => ({
        // 👤 Get logged-in user's profile
        getProfile: builder.query({
            query: () => `${USER_API_URL}/profile`,
            // This query is for the *logged-in* user's profile, so it provides the 'User' tag
            providesTags: ['User'],
        }),

        // ➕ Follow a user
        followUser: builder.mutation({
            query: (userId) => ({
                url: `${USER_API_URL}/${userId}/follow`,
                method: 'POST',
            }),
            // Invalidate the current user's profile ('User') and the followed user's specific profile ('User:userId')
            invalidatesTags: (result, error, userId) => [
                'User', // For the current user (their following list changes)
                { type: 'User', id: userId } // For the user being followed (their followers list changes)
            ],
        }),

        // ➖ Unfollow a user
        unfollowUser: builder.mutation({
            query: (userId) => ({
                url: `${USER_API_URL}/${userId}/unfollow`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, userId) => [
                'User', // For the current user
                { type: 'User', id: userId } // For the user being unfollowed
            ],
        }),

        updateProfile: builder.mutation({
            query: (updatedProfileData) => ({
                url: `${USER_API_URL}/profile`, // Assuming it's YOUR profile update
                method: 'PUT',
                body: updatedProfileData,
            }),
            // Invalidate the current user's profile after an update
            invalidatesTags: ['User'],
        }),

        // 👤 Get any user by ID
        getUserById: builder.query({
            query: (userId) => `${USER_API_URL}/${userId}`,
            // Provide a specific tag for this user's profile to allow granular invalidation
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetProfileQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useUpdateProfileMutation,
    useGetUserByIdQuery
} = extendedApi;