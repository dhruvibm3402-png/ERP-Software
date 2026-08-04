
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export function useLoyaltyMembers() {
  return useQuery({
    queryKey: ['loyaltyMembers'],
    queryFn: () => apiClient.get('/loyalty/members').then(res => res.data.data)
  });
}

export function useLoyaltyTiers() {
  return useQuery({
    queryKey: ['loyaltyTiers'],
    queryFn: () => apiClient.get('/loyalty/tiers').then(res => res.data.data)
  });
}

export function useIssuePoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/loyalty/points/issue', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyaltyMembers'] });
    }
  });
}
