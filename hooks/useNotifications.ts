import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '../store/notificationStore';
import apiClient from '../utils/apiClient';

export const useNotifications = (
  params: { skip?: number; take?: number; unreadOnly?: boolean; type?: string } = {}
) => {
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  const query = new URLSearchParams();
  if (params.skip !== undefined) query.append('skip', params.skip.toString());
  if (params.take !== undefined) query.append('take', params.take.toString());
  if (params.unreadOnly) query.append('unreadOnly', 'true');
  if (params.type) query.append('type', params.type);

  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const data = (await apiClient.get(`/notifications?${query.toString()}`)).data;
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
      return data;
    },
    refetchInterval: 30000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return (await apiClient.put(`/notifications/${id}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return (await apiClient.put(`/notifications/mark-all`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return (await apiClient.delete(`/notifications/${id}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => (await apiClient.get('/notifications/preferences')).data,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return (await apiClient.put('/notifications/preferences', data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
};
