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
            invalidatesTags: (result, error, userId) => [
                'User', 
                { type: 'User', id: userId }
            ],
        }),

        // ➖ Unfollow a user
        unfollowUser: builder.mutation({
            query: (userId) => ({
                url: `${USER_API_URL}/${userId}/unfollow`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, userId) => [
                'User', 
                { type: 'User', id: userId }
            ],
        }),

        updateProfile: builder.mutation({
            query: (updatedProfileData) => ({
                url: `${USER_API_URL}/profile`,
                method: 'PUT',
                body: updatedProfileData,
            }),
            invalidatesTags: (result) => [
                'User',
                { type: 'User', id: result?._id }
            ],
        }),

        // 👤 Get any user by ID
        getUserById: builder.query({
            query: (userId) => `${USER_API_URL}/${userId}`,
            providesTags: (result, error, id) => [
                'User',
                { type: 'User', id }
            ],
        }),

        // 🔑 Login
        login: builder.mutation({
            query: (credentials) => ({
                url: `${USER_API_URL}/login`,
                method: 'POST',
                body: credentials,
            }),
        }),

        // 📝 Register
        register: builder.mutation({
            query: (userData) => ({
                url: `${USER_API_URL}/register`,
                method: 'POST',
                body: userData,
            }),
        }),

        // 🚪 Logout
        logout: builder.mutation({
            query: () => ({
                url: `${USER_API_URL}/logout`,
                method: 'POST',
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetProfileQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useUpdateProfileMutation,
    useGetUserByIdQuery,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
} = extendedApi;