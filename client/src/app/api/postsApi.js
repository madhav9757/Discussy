import { discusslyApi } from './discusslyApi';

const extendedPostsApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all posts
    getPosts: builder.query({
      query: () => '/posts',
      providesTags: ['Post'],
    }),

    // Get post by ID
    getPostById: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // Create post
    createPost: builder.mutation({
      query: (data) => ({
        url: '/posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),

    // Update post
    updatePost: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Post', id },
        'Post',
      ],
    }),

    // Delete post
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),

    // Toggle vote
    toggleVote: builder.mutation({
      query: ({ id, type }) => ({
        url: `/posts/${id}/vote`,
        method: 'PATCH',
        body: { type }, // type = "upvote" or "downvote"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleVoteMutation,
} = extendedPostsApi;
