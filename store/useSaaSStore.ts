import { create } from 'zustand';

interface SaaSState {
  currentTenantId: string | null;
  setCurrentTenantId: (id: string) => void;
}

export const useSaaSStore = create<SaaSState>((set) => ({
  currentTenantId: null,
  setCurrentTenantId: (id) => set({ currentTenantId: id }),
}));
