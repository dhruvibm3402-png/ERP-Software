
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
