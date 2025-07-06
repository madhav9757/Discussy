import { discusslyApi } from "./discusslyApi";
import { USER_API_URL } from "../constant";

const extendedApi = discusslyApi.injectEndpoints({
    endpoints: (builder) => ({
        // 👤 Get logged-in user's profile
        getProfile: builder.query({
            query: () => `${USER_API_URL}/profile`,
            providesTags: ['Profile'],
        }),

        // ➕ Follow a user
        followUser: builder.mutation({
            query: (userId) => ({
                url: `${USER_API_URL}/${userId}/follow`,
                method: 'POST',
            }),
            invalidatesTags: ['Profile'],
        }),

        // ➖ Unfollow a user
        unfollowUser: builder.mutation({
            query: (userId) => ({
                url: `${USER_API_URL}/${userId}/unfollow`,
                method: 'POST',
            }),
            invalidatesTags: ['Profile'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetProfileQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
} = extendedApi;
