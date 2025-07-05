import { apiSlice } from '../../app/apiSlice';

export const communityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommunityById: builder.query({
      query: (id) => `/communities/${id}`,
    }),
  }),
});

export const { useGetCommunityByIdQuery } = communityApi;
