import { discusslyApi } from './discusslyApi';

const extendedApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunities: builder.query({
      query: () => '/communities',
      providesTags: ['Community'],
    }),
    getCommunityById: builder.query({
      query: (id) => `/communities/${id}`,
      providesTags: (result, error, id) => [{ type: 'Community', id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCommunitiesQuery, useGetCommunityByIdQuery } = extendedApi;
