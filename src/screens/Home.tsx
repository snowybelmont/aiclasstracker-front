import React, { useEffect } from 'react'
import { getNetworkStateAsync, NetworkState } from 'expo-network'
import { View, Text } from 'react-native'
import { Button } from '@rneui/base'
import { Skeleton } from '@rneui/themed'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@/store/AuthStore'
import { useUserStore } from '@/store/UserStore'
import { useSchoolStore } from '@/store/SchoolStore'
import { loginService} from '@/services/LoginService'
import { userService } from '@/services/UserService'
import { schoolService } from '@/services/SchoolService'

const Home = ({ navigation }: any) => {
    const {isAutenticated, setAuthState} = useAuthStore()
    const {user, setUser} = useUserStore()
    const {dailyLessons, setDailyLessons} = useSchoolStore()

    useEffect(() => {
        const checkAuthState = async(networkState: NetworkState) => {
            let tokenExists = true
            if(networkState.isConnected && isAutenticated) {
                tokenExists = await loginService.checkTokenExists()
            }

            if(isAutenticated && tokenExists) {
                setAuthState(true)
                return true
            }

            setAuthState(false)
            navigation.reset({index: 0, routes: [{name: 'Login', params: {sessionExpired: true}}]})
            return false
        }

        const getUserData = async(networkState: NetworkState) => {
            let dataApi
            if(networkState.isConnected) {
                dataApi = await userService.getUser().then()
            }

            const userData = dataApi || user

            if(userData) {
                setUser(userData)
                return userData.ra
            }

            return null
        }

        const getDailyLessons = async(networkState: NetworkState, ra: number) => {
            let dataApi
            if (networkState.isConnected && ra != null) {
                dataApi = await schoolService.getDailyLessons(ra).then()
            }

            const dailyLessonsData = dataApi || dailyLessons

            if (dailyLessonsData) {
                setDailyLessons(dailyLessonsData.filter((item: any) => item.day = new Date().getDay()))
            } else {
                setDailyLessons([])
            }
        }

        getNetworkStateAsync().then(
            (networkState) =>
                checkAuthState(networkState).then((autenticated) => {
                    if(autenticated) getUserData(networkState).then((ra) => getDailyLessons(networkState, ra))
                })
        )
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: '#663399', paddingTop: 40, paddingHorizontal: 30 }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 5 }}>
                Olá, {!user?.surname ? (
                <View style={{ width: '50%' }}>
                    <Skeleton
                        LinearGradientComponent={LinearGradient}
                        animation='wave'
                        style={{ borderRadius: 10 }}
                        height={20}
                    />
                </View>
                ) : user?.surname}
            </Text>
            <Text style={{ fontSize: 18, textAlign: 'justify', color: '#fff', marginBottom: 40 }}>
                {!user?.role
                    ? (
                        <View style={{ width: '100%', gap: 5 }}>
                            <Skeleton
                                LinearGradientComponent={LinearGradient}
                                animation='wave'
                                style={{ borderRadius: 10 }}
                                height={20}
                            />
                            <Skeleton
                                LinearGradientComponent={LinearGradient}
                                animation='wave'
                                style={{ borderRadius: 10 }}
                                height={20}
                            />
                            <Skeleton
                                LinearGradientComponent={LinearGradient}
                                animation='wave'
                                style={{ borderRadius: 10 }}
                                height={20}
                            />
                        </View>
                    ) : user?.role == 'P'
                        ? 'Para iniciar o processo do registro de presenças, selecione a turma e inicie o reconhecimento facial. Caso queira consultar, o registro ficará armazenado em “histórico de registros”'
                        : 'Bem vindo ao AI Class Tracker. Aqui você pode conferir suas aulas, conferir seu registro de presenças e ficar por dentro dos eventos e programações da sua instuição, de forma simples e rápida'
                }
            </Text>
            <Text style={{ fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 10 }}>
                Grade Diária
            </Text>
            <View style={{ width: '100%', marginBottom: 30 }}>
                {dailyLessons == null ? (
                    <Skeleton
                        LinearGradientComponent={LinearGradient}
                        animation='wave'
                        style={{ borderRadius: 10 }}
                        height={400}
                    />
                ) : dailyLessons?.length == 0
                    ? <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                        {!user?.role ? (
                            <Skeleton
                                LinearGradientComponent={LinearGradient}
                                animation='wave'
                                style={{ borderRadius: 10 }}
                                height={20}
                            />
                        ) : user?.role === 'P' ? 'Nenhuma aula para ministrar hoje' : 'Não haverá aulas hoje'}
                    </Text>
                    : (
                        <>
                        <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#ddd', justifyContent: 'space-around', paddingBottom: 10, alignItems: 'center' }}>
                            <Text style={{ width: '20%', fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Sala</Text>
                            <Text style={{ width: '30%', fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Horário</Text>
                            <Text style={{ width: '20%', fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Aula</Text>
                            {user?.role == 'P'
                                ? <Text style={{ width: '30%', fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Turma</Text>
                                : <Text style={{ width: '30%', fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Professor</Text>
                            }
                        </View>
                        {dailyLessons?.map((lesson: { room: string, time: string, lessonAbr: string, semester: number, curseAbr: string, professorSurname: string }, index: number) => (
                            <View key={index} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
                                <Text style={{ width: '20%', fontSize: 16, color: '#fff', textAlign: 'center' }}>{lesson?.room}</Text>
                                <Text style={{ width: '30%', fontSize: 16, color: '#fff', textAlign: 'center' }}>{lesson?.time}</Text>
                                <Text style={{ width: '20%', fontSize: 16, color: '#fff', textAlign: 'center' }}>{lesson?.lessonAbr}</Text>
                                {user?.role == 'P'
                                    ? <Text style={{ width: '30%', fontSize: 16, color: '#fff', textAlign: 'center' }}>{lesson?.semester + 'º ' + lesson?.curseAbr}</Text>
                                    : <Text style={{ width: '28%', fontSize: 16, color: '#fff', textAlign: 'center' }}>{lesson?.professorSurname}</Text>
                                }
                            </View>
                        ))}
                    </>
                    )}
            </View>
            <View style={{ alignItems: 'center' }}>
                <Button
                    containerStyle={{ width: '50%' }}
                    buttonStyle={{ height: 55, borderRadius: 10, backgroundColor: '#58C878' }}
                    titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#1E1E1E' }}
                    loadingProps={{ size: 28, color: '#1E1E1E' }}
                    title='Iniciar Chamada'
                    onPress={navigation.navigate('Camera')}
                />
            </View>
        </View>
    )
}

export default Home