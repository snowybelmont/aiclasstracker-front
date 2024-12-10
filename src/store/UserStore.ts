import { create } from 'zustand'
import { userService } from '@/services/UserService'

type User = {
    ra: number,
    surname: string,
    role: string,
    message: string,
}

type UserStore = {
    user: User,
    setUser: (user: User) => void,
}

export const useUserStore = create<UserStore>((set) => ({
    user: userService.getUserFromStorage() || {},
    setUser: (user) => set(() => ({ user })),
}))
