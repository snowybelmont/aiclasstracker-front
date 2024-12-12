import React, {useEffect, useState} from 'react'
import { getNetworkStateAsync, NetworkState } from 'expo-network'
import { View, Text } from 'react-native'
import { Button } from '@rneui/base'
import { Dialog, Skeleton } from '@rneui/themed'
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
    const [error, setError] = useState<{validation?: {title: string; message: string}}>({})
    const [havePendence, setHavePendence] = useState<boolean>(false)

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
                const data = await schoolService.checkPendences(ra, dailyLessonsData?.filter((item: any) => item.day = new Date().getDay()))
                setDailyLessons(dailyLessonsData?.filter((item: any) => item.day = new Date().getDay()))
                setHavePendence(data?.havePendencies)
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

    const checkIsLessonTime = () => {
        return dailyLessons?.some((item: any) => {
            const now = new Date('2022-01-01T21:30:00.000Z')
            const times = item?.time?.split(' - ')
            const [startHour, startMinutes] = times[0]?.split(':')
            const [endHour, endMinutes] = times[1]?.split(':')

            const nowMs = now.getTime() % (24 * 60 * 60 * 1000)
            const startMs = (startHour * 60 * 60 * 1000 + parseInt(startMinutes) * 60 * 1000)
            const endMs = (endHour * 60 * 60 * 1000 + parseInt(endMinutes) * 60 * 1000)

            return nowMs >= startMs && nowMs <= endMs
        })
    }

    const handleStartCall = () => {
        if(!checkIsLessonTime()) {
            setError({validation: {title: 'Aula não iniciada', message: `Você esta fora do horário de aula, tente novamente mais tarde`}})
            return
        }

        navigation.navigate('Camera')
    }

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
            {user?.role == 'P' && (
                <View style={{ alignItems: 'center' }}>
                    <Button
                        containerStyle={{ width: '50%', marginBottom: 20 }}
                        buttonStyle={{ height: 55, borderRadius: 10, backgroundColor: '#58C878' }}
                        titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#1E1E1E' }}
                        loadingProps={{ size: 28, color: '#1E1E1E' }}
                        title='Iniciar Chamada'
                        onPress={handleStartCall}
                        disabled={dailyLessons?.length === 0}
                    />
                </View>
            )}
            {(user?.role == 'P' && havePendence) && (
                <View style={{ alignItems: 'center' }}>
                    <Button
                        containerStyle={{ width: '50%' }}
                        buttonStyle={{ height: 65, borderRadius: 10, backgroundColor: '#58C878' }}
                        titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#1E1E1E' }}
                        loadingProps={{ size: 28, color: '#1E1E1E' }}
                        title='Enviar chamada para o sistema'
                        onPress={handleStartCall}
                        disabled={!havePendence}
                    />
                </View>
            )}
            {error?.validation && (
                <Dialog
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    isVisible={!!error?.validation}
                    onBackdropPress={() => setError({})}
                >
                    <Dialog.Title title={error?.validation?.title} />
                    <Text>{error?.validation?.message}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3690da', textAlign: 'center', marginEnd: 14, marginTop: 10 }}
                              onPress={() => setError({})}>
                            FECHAR
                        </Text>
                    </View>
                </Dialog>
            )}
        </View>
    )
}

export default Home