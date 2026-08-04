const fs = require('fs');

const dirs = [
    'src/components/loyalty',
    'store',
    'hooks',
    'types',
    'schemas'
];

dirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Create Types
fs.writeFileSync('types/loyalty.types.ts', `
export interface LoyaltyMember {
  id: string;
  customerId: string;
  tierId: string;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentPoints: number;
  Customer: any;
  Tier: any;
  joinDate: string;
}
export interface Coupon {
  id: string; code: string; discountType: string; discountValue: number;
}
export interface LoyaltyReward {
  id: string; name: string; type: string; pointsCost: number;
}
`);

// Create Zustand Store
fs.writeFileSync('store/loyaltyStore.ts', `
import { create } from 'zustand';
import { LoyaltyMember, Coupon, LoyaltyReward } from '../types/loyalty.types';

interface LoyaltyStore {
  selectedMember: LoyaltyMember | null;
  setSelectedMember: (m: LoyaltyMember | null) => void;
  isIssuePointsModalOpen: boolean;
  setIssuePointsModal: (open: boolean) => void;
}

export const useLoyaltyStore = create<LoyaltyStore>((set) => ({
  selectedMember: null,
  setSelectedMember: (selectedMember) => set({ selectedMember }),
  isIssuePointsModalOpen: false,
  setIssuePointsModal: (open) => set({ isIssuePointsModalOpen: open })
}));
`);

// Create React Query Hooks
fs.writeFileSync('hooks/useLoyalty.ts', `
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
`);
