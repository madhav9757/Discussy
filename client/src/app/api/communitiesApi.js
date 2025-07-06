import { discusslyApi } from "./discusslyApi";
import { COMMUNITY_API_URL } from "../constant";

const extendedApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get all communities
    getCommunities: builder.query({
      query: () => `${COMMUNITY_API_URL}`,
      providesTags: ['Community'],
    }),

    // 🔍 Get a specific community
    getCommunityById: builder.query({
      query: (id) => `${COMMUNITY_API_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Community', id }],
    }),

    // ✅ Join community
    joinCommunity: builder.mutation({
      query: (communityId) => ({
        url: `${COMMUNITY_API_URL}/${communityId}/join`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, communityId) => [
        { type: 'Community', id: communityId },
      ],
    }),

    // ✅ Leave community
    leaveCommunity: builder.mutation({
      query: (communityId) => ({
        url: `${COMMUNITY_API_URL}/${communityId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, communityId) => [
        { type: 'Community', id: communityId },
      ],
    }),

    // 🗑️ Delete community
    deleteCommunity: builder.mutation({
      query: (communityId) => ({
        url: `${COMMUNITY_API_URL}/${communityId}`,
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
