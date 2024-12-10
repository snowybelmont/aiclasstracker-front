import axios from 'axios'
import { MMKV } from 'react-native-mmkv'
import { loginService } from '@/services/LoginService'

const storage = new MMKV({ id: `${process.env.EXPO_PUBLIC_ID_MMKV}` })

class SchoolService {
    readonly saveDailyLessonsInStorage = (lessons: any) => {
        try {
            storage.set('dailyLessons', JSON.stringify(lessons))
        } catch (error) {
            console.log('Erro ao salvar as aulas do dia no storage: ', error)
            throw error
        }
    }

    readonly getDailyLessonsFromStorage = () => {
        try {
            const data = storage.getString('dailyLessons')
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.log('Erro ao obter as aulas do dia do storage: ', error)
        }
        return null
    }

    readonly getDailyLessons = async(ra: number) => {
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_JAVA_API_URL}/school/users/${ra}/dailyLessons`, {
                    headers: {
                        'Authorization': `Bearer ${loginService.getBearerTokenFromStorage()}`
                    },
                    timeout: Number(process.env.EXPO_PUBLIC_JAVA_API_TIMEOUT)
                })

            if(response?.data) {
                this.saveDailyLessonsInStorage(response.data)
                return response.data
            }
        } catch (error) {
            console.log('Erro ao consumir a api para obter as aulas do dia: ', error)
        }
        return null
    }

    readonly saveHistoryInStorage = (history: any) => {
        try {
            storage.set('history', JSON.stringify(history))
        } catch (error) {
            console.log('Erro ao salvar as aulas do dia no storage: ', error)
            throw error
        }
    }

    readonly getHistoryFromStorage = () => {
        try {
            const data = storage.getString('history')
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.log('Erro ao obter as aulas do dia do storage: ', error)
        }
        return null
    }

    readonly getHistory = async(ra: number) => {
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_JAVA_API_URL}/school/users/${ra}/history`, {
                    headers: {
                        'Authorization': `Bearer ${loginService.getBearerTokenFromStorage()}`
                    },
                    timeout: Number(process.env.EXPO_PUBLIC_JAVA_API_TIMEOUT)
                })

            if(response?.data) {
                this.saveHistoryInStorage(response.data)
                return response.data
            }
        } catch (error) {
            console.log('Erro ao consumir a api para obter as aulas do dia: ', error)
        }
        return null
    }

    readonly saveFaultsStatsInStorage = (faults: any) => {
        try {
            storage.set('falts', JSON.stringify(faults))
        } catch (error) {
            console.log('Erro ao salvar as estastisticas de faltas no storage: ', error)
            throw error
        }
    }

    readonly getFaultsStatsFromStorage = () => {
        try {
            const data = storage.getString('falts')
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.log('Erro ao obter as estastisticas de faltas do storage: ', error)
        }
        return null
    }

    readonly getFaultsStats = async(ra: number) => {
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_JAVA_API_URL}/school/users/${ra}/faults`, {
                    headers: {
                        'Authorization': `Bearer ${loginService.getBearerTokenFromStorage()}`
                    },
                    timeout: Number(process.env.EXPO_PUBLIC_JAVA_API_TIMEOUT)
                })

            if(response?.data) {
                this.saveFaultsStatsInStorage(response.data)
                return response.data
            }
        } catch (error) {
            console.log('Erro ao consumir a api para as estatisticas de faltas: ', error)
        }
        return null
    }
}

const schoolService = new SchoolService()
export { schoolService }