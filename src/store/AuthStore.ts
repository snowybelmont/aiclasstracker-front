import { create } from 'zustand'
import { loginService } from '@/services/LoginService'

type AuthStore = {
    isAutenticated: boolean,
    setAuthState: (authState: boolean) => void,
}

export const useAuthStore = create<AuthStore>((set) => ({
    isAutenticated: loginService.checkTokenIsPresent(),
    setAuthState: (authState) => set(() => ({isAutenticated: authState})),
}))