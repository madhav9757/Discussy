import { discusslyApi } from "./discusslyApi";

const extendedApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get all communities
    getCommunities: builder.query({
      query: () => '/communities',
      providesTags: ['Community'],
    }),

    // 🔍 Get a specific community
    getCommunityById: builder.query({
      query: (id) => `/communities/${id}`,
      providesTags: (result, error, id) => [{ type: 'Community', id }],
    }),

    // ✅ Join community
    joinCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/communities/${communityId}/join`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, communityId) => [
        { type: 'Community', id: communityId },
      ],
    }),

    // ✅ Leave community
    leaveCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/communities/${communityId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, communityId) => [
        { type: 'Community', id: communityId },
      ],
    }),

    // 🗑️ Delete community
    deleteCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/communities/${communityId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Community'],
    }),
  }),
  overrideExisting: false,
});


export const {
  useGetCommunitiesQuery,
  useGetCommunityByIdQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useDeleteCommunityMutation
} = extendedApi;
