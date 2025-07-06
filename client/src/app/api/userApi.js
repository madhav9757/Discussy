import { discusslyApi } from "./discusslyApi";

const extendedApi = discusslyApi.injectEndpoints({
    endpoints: (builder) => ({

        getProfile: builder.query({
            query: () => 'users/profile',
            providesTags: ['Profile'],
        }),

        followUser: builder.mutation({
            query: (userId) => ({
                url: `/users/${userId}/follow`,
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),

        // 👤 Unfollow a user
        unfollowUser: builder.mutation({
            query: (userId) => ({
                url: `/users/${userId}/unfollow`,
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),
    })
})

export const { useGetProfileQuery, useFollowUserMutation, useUnfollowUserMutation } = extendedApi;
