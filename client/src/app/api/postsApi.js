import { discusslyApi } from './discusslyApi';
import { POST_API_URL } from '../constant';

const extendedPostsApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all posts
    getPosts: builder.query({
      query: () => POST_API_URL,
      providesTags: ['Post'],
    }),

    // Get post by ID
    getPostById: builder.query({
      query: (id) => `${POST_API_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // Create post
    createPost: builder.mutation({
      query: (data) => ({
        url: POST_API_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),

    // Update post
    updatePost: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${POST_API_URL}/${id}`,
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
        url: `${POST_API_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),

    // Toggle vote
    toggleVote: builder.mutation({
      query: ({ id, type }) => ({
        url: `${POST_API_URL}/${id}/vote`,
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
