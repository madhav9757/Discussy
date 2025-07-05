import { discusslyApi } from './discusslyApi';

const extendedApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommentsByPostId: builder.query({
      query: (postId) => `/posts/${postId}/comments`,
      providesTags: (result, error, postId) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: 'Comments', id: _id })),
            { type: 'Comments', id: postId },
          ]
          : [{ type: 'Comments', id: postId }],
    }),
    createComment: builder.mutation({
      query: ({ postId, content, parentId = null }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: { content, parentId },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comments', id: postId },
      ],
    }),

    updateComment: builder.mutation({
      query: ({ commentId, postId, content }) => ({
        url: `/comments/${commentId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (result, error, { commentId, postId }) => [
        { type: 'Comments', id: commentId },
        { type: 'Comments', id: postId },
      ],
    }),

    deleteComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { commentId, postId }) => [
        { type: 'Comments', id: commentId },
        { type: 'Comments', id: postId },
      ],
    }),

    toggleCommentVote: builder.mutation({
      query: ({ commentId, postId, type }) => ({
        url: `/comments/${commentId}/vote`,
        method: 'POST',
        body: { type },
      }),
      invalidatesTags: (result, error, { commentId, postId }) => [
        { type: 'Comments', id: commentId },
        { type: 'Comments', id: postId },
      ],
    }),
    overrideExisting: false,
  }),
});

export const {
  useGetCommentsByPostIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentVoteMutation,
} = extendedApi;
