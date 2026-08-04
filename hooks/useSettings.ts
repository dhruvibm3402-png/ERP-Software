import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

export const useSettings = (category: string) => {
  return useQuery({
    queryKey: ['settings', category],
    queryFn: async () => (await apiClient.get(`/settings?category=${category}`)).data,
    enabled: !!category,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ category, data }: { category: string; data: any }) =>
      (await apiClient.post('/settings', { category, data })).data,
    onSuccess: (_, { category }) => {
      queryClient.invalidateQueries({ queryKey: ['settings', category] });
      toast.success('Settings updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to update settings');
    }
  });
};

export const useBackupSystem = () => {
  return useMutation({
    mutationFn: async () => (await apiClient.post('/settings/backup')).data,
  });
};
