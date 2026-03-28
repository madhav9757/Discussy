import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constant';

export const discusslyApi = createApi({
  reducerPath: 'discusslyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token && token !== 'undefined' && token !== 'null') {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Post', 'Community', 'Comments', 'User', 'Notification'],
  endpoints: () => ({}), // Will be injected later
});
