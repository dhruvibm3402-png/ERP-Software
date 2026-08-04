import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export const useBranches = (params: { skip?: number, take?: number, search?: string, status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.append('skip', params.skip.toString());
    if (params.take !== undefined) query.append('take', params.take.toString());
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    return useQuery({
        queryKey: ['branches', params],
        // since apiClient adds /api/v1 natively, we just dial /branches
        queryFn: async () => (await apiClient.get(`/branches?${query.toString()}`)).data,
    });
};

export const useBranch = (id: string) => {
    return useQuery({
        queryKey: ['branch', id],
        queryFn: async () => (await apiClient.get(`/branches/${id}`)).data,
        enabled: !!id,
    });
};

export const useBranchAnalytics = (id: string) => {
    return useQuery({
        queryKey: ['branch-analytics', id],
        queryFn: async () => (await apiClient.get(`/branches/${id}/analytics`)).data,
        enabled: !!id,
    });
};

export const useBranchInventory = (id: string, params: { skip?: number, take?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.append('skip', params.skip.toString());
    if (params.take !== undefined) query.append('take', params.take.toString());

    return useQuery({
        queryKey: ['branch-inventory', id, params],
        queryFn: async () => (await apiClient.get(`/branches/${id}/inventory?${query.toString()}`)).data,
        enabled: !!id,
    });
};

export const useBranchEmployees = (id: string, params: { skip?: number, take?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.append('skip', params.skip.toString());
    if (params.take !== undefined) query.append('take', params.take.toString());

    return useQuery({
        queryKey: ['branch-employees', id, params],
        queryFn: async () => (await apiClient.get(`/branches/${id}/employees?${query.toString()}`)).data,
        enabled: !!id,
    });
};

export const useCreateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => (await apiClient.post('/branches', data)).data,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] })
    });
};

export const useUpdateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => (await apiClient.put(`/branches/${id}`, data)).data,
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            queryClient.invalidateQueries({ queryKey: ['branch', id] });
        }
    });
};

export const useDeleteBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => (await apiClient.delete(`/branches/${id}`)).data,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] })
    });
};
