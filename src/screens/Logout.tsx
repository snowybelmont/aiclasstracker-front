import { useEffect,useState } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { loginService } from '@/services/LoginService'
import { useAuthStore } from '@/store/AuthStore'
import { useUserStore } from '@/store/UserStore'
import { useSchoolStore } from '@/store/SchoolStore'

const Logout = ({ navigation }: any) => {
    const {setAuthState} = useAuthStore()
    const {setUser} = useUserStore()
    const {
        setDailyLessons,
        setHistory,
        setLessonsList,
        setCheckedLessonOne,
        setCheckedLessonTwo,
        setDate,
        setHistoryFiltered,
        setFaultsStats,
        setFaultsStatsFiltered,
        setIndexTab
    } = useSchoolStore()

    useEffect(() => {
        setTimeout(() => {
            loginService.logout()

            setDailyLessons([])
            setHistory([])
            setLessonsList([])
            setCheckedLessonOne(1)
            setCheckedLessonTwo(1)
            setIndexTab(0)
            setDate(new Date())
            setHistoryFiltered([])
            setFaultsStats([])
            setFaultsStatsFiltered(undefined)
            setAuthState(false)

            navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
        }, 10)
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: '#663399', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size='large' color='#fff' />
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 5 }}>
                Saindo...
            </Text>
        </View>
    )
}

export default Logout