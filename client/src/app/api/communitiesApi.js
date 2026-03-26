import { discusslyApi } from "./discusslyApi";
import { COMMUNITY_API_URL } from "../constant";

const extendedApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get all communities
    getCommunities: builder.query({
      query: () => `${COMMUNITY_API_URL}`,
      providesTags: ['Community'],
    }),

    // 🔍 Get a specific community by ID or Name
    getCommunityById: builder.query({
      query: (idOrName) => `${COMMUNITY_API_URL}/${idOrName}`,
      providesTags: (result, error, idOrName) => [{ type: 'Community', id: idOrName }],
    }),

    // ✅ Create new community - UPDATED to include description and category
    createCommunity: builder.mutation({
      query: ({ name, description, category }) => ({ 
        url: `${COMMUNITY_API_URL}`,
        method: 'POST',
        body: { name, description, category }, 
      }),
      invalidatesTags: ['Community'],
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
    // 📝 Update community
    updateCommunity: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `${COMMUNITY_API_URL}/${id}`,
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Community',
        { type: 'Community', id },
      ],
    }),
  }),
  overrideExisting: false,
});


export const {
  useGetCommunitiesQuery,
  useGetCommunityByIdQuery,
  useCreateCommunityMutation,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useDeleteCommunityMutation,
  useUpdateCommunityMutation,
} = extendedApi;