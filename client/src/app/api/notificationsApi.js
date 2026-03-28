// src/app/api/notificationsApi.js

import { discusslyApi } from '../../app/api/discusslyApi';
import { NOTIFICATION_API_URL } from '../constant';

const extendedNotificationsApi = discusslyApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => NOTIFICATION_API_URL,
      providesTags: ['Notification'],
    }),

    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: `${NOTIFICATION_API_URL}/read-all`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATION_API_URL}/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notification', id },
        'Notification',
      ],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATION_API_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteAllNotifications: builder.mutation({
      query: () => ({
        url: NOTIFICATION_API_URL,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} = extendedNotificationsApi;

export const notificationsApi = extendedNotificationsApi;