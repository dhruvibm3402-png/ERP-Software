import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    updateToken: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            setAuth: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
            updateToken: (token) => set({ accessToken: token }),
            logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
        }),
        {
            name: 'aura-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
