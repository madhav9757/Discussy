// services/api/discusslyApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const discusslyApi = createApi({
  reducerPath: 'discusslyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Post', 'Community', 'Comments', 'User'],
  endpoints: () => ({}), // Will be injected later
});
