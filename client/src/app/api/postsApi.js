import { discusslyApi } from './discusslyApi';

const extendedApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => '/posts',
      providesTags: ['Post'],
    }),
    getPostById: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    // Add more post-related endpoints here
  }),
  overrideExisting: false,
});

export const { useGetPostsQuery, useGetPostByIdQuery } = extendedApi;
