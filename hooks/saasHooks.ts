import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export const useTenants = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => (await apiClient.get('/saas/tenants')).data
  });
};

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await apiClient.get('/saas/plans')).data
  });
};

export const useTenantDashboard = (tenantId: string) => {
  return useQuery({
    queryKey: ['tenantDashboard', tenantId],
    queryFn: async () => (await apiClient.get(`/saas/tenants/${tenantId}/dashboard`)).data,
    enabled: !!tenantId,
  });
};
