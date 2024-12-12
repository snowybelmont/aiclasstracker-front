import { create } from 'zustand'
import { schoolService } from '@/services/SchoolService'

type DailyLessons = {
    room: string,
    time: string,
    day: number,
    lessonAbr: string,
    semester: number,
    curseAbr: string,
    professorSurname: string,
}

type History = {
    callDate: string,
    lessonAbr: string,
    classDesc: string,
    curseAbr: string,
    ra: number,
    userName: string,
    userPhoto: string,
    havePresence: boolean,
}

type LessonsList = {
    name: string,
}

type FaultsStats = {
    lessonAbr: string,
    lessonName: string,
    classDesc: string,
    curseAbr: string,
    professorSurname: string,
    totalCalls: number,
    totalFalts: number,
    percentFalts: number,
    maxFalts: number,
}

type SchoolStore = {
    dailyLessons: DailyLessons[],
    setDailyLessons: (dailyLessons: DailyLessons[]) => void,
    history: History[],
    setHistory: (history: History[]) => void,
    lessonsList: LessonsList[],
    setLessonsList: (lessons: LessonsList[]) => void,
    checkedLessonOne: number,
    setCheckedLessonOne: (index: number) => void,
    checkedLessonTwo: number,
    setCheckedLessonTwo: (index: number) => void,
    date: Date,
    setDate: (date: Date) => void,
    historyFiltered: History[],
    setHistoryFiltered: (history: History[]) => void,
    faultsStats: FaultsStats[],
    setFaultsStats: (faultsStats: FaultsStats[]) => void,
    faultsStatsFiltered: FaultsStats | undefined,
    setFaultsStatsFiltered: (faultsStats: FaultsStats) => void,
}

export const useSchoolStore = create<SchoolStore>((set) => ({
    dailyLessons: schoolService.getDailyLessonsFromStorage(),
    setDailyLessons: (dailyLessons: DailyLessons[]) => set(() => ({ dailyLessons: dailyLessons })),
    history: schoolService.getHistoryFromStorage(),
    setHistory: (history: History[]) => set(() => ({ history: history })),
    lessonsList: [],
    setLessonsList: (lessons: LessonsList[]) => set(() => ({ lessonsList: lessons })),
    checkedLessonOne: 1,
    setCheckedLessonOne: (index: number) => set(() => ({ checkedLessonOne: index })),
    checkedLessonTwo: 1,
    setCheckedLessonTwo: (index: number) => set(() => ({ checkedLessonTwo: index })),
    date: new Date(),
    setDate: (date: Date) => set(() => ({ date: date })),
    historyFiltered: [],
    setHistoryFiltered: (history: History[]) => set(() => ({ historyFiltered: history })),
    faultsStats: schoolService.getFaultsStatsFromStorage(),
    setFaultsStats: (faultsStats: FaultsStats[]) => set(() => ({ faultsStats: faultsStats })),
    faultsStatsFiltered: undefined,
    setFaultsStatsFiltered: (faultsStats: FaultsStats) => set(() => ({ faultsStatsFiltered: faultsStats })),
}))