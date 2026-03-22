import { discusslyApi } from './discusslyApi';

export const exploreApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrendingPosts: builder.query({
      query: () => '/explore/trending-posts',
      providesTags: ['Post'],
    }),
    getPopularCommunities: builder.query({
      query: () => '/explore/popular-communities',
      providesTags: ['Community'],
    }),
    getNewCommunities: builder.query({
      query: () => '/explore/new-communities',
      providesTags: ['Community'],
    }),
    getTopCreators: builder.query({
      query: () => '/explore/top-creators',
    }),
    getCommunityCategories: builder.query({
      query: () => '/explore/categories',
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTrendingPostsQuery,
  useGetPopularCommunitiesQuery,
  useGetNewCommunitiesQuery,
  useGetTopCreatorsQuery,
  useGetCommunityCategoriesQuery,
} = exploreApi;
