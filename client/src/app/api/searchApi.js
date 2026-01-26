// client/src/app/api/searchApi.js
import { discusslyApi } from './discusslyApi';

export const searchApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    // General search across all content types
    search: builder.query({
      query: ({ q, type = 'all', page = 1, limit = 20 }) => {
        const params = new URLSearchParams({
          q,
          type,
          page: page.toString(),
          limit: limit.toString(),
        });
        return `/search?${params}`;
      },
      // Keep search results in cache for 5 minutes
      keepUnusedDataFor: 300,
    }),

    // Advanced post search
    searchPosts: builder.query({
      query: ({ 
        q, 
        community, 
        author, 
        sortBy = 'relevance', 
        timeRange = 'all',
        page = 1, 
        limit = 20 
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          timeRange,
        });
        
        if (q) params.append('q', q);
        if (community) params.append('community', community);
        if (author) params.append('author', author);

        return `/search/posts?${params}`;
      },
      keepUnusedDataFor: 300,
    }),

    // Community search
    searchCommunities: builder.query({
      query: ({ 
        q, 
        category, 
        sortBy = 'relevance', 
        page = 1, 
        limit = 20 
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
        });
        
        if (q) params.append('q', q);
        if (category) params.append('category', category);

        return `/search/communities?${params}`;
      },
      keepUnusedDataFor: 300,
    }),

    // Get search suggestions (autocomplete)
    getSearchSuggestions: builder.query({
      query: (q) => `/search/suggestions?q=${encodeURIComponent(q)}`,
      // Cache suggestions for only 1 minute
      keepUnusedDataFor: 60,
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchQuery,
  useSearchPostsQuery,
  useSearchCommunitiesQuery,
  useGetSearchSuggestionsQuery,
} = searchApi;