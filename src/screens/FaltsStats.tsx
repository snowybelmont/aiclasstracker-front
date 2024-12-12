import React, { useEffect, useState } from 'react'
import { getNetworkStateAsync, NetworkState } from 'expo-network'
import { View, Text, ScrollView } from 'react-native'
import { CheckBox, Dialog, Skeleton } from '@rneui/themed'
import { LinearGradient } from 'expo-linear-gradient'
import { PieChart } from 'react-native-gifted-charts'
import { useAuthStore } from '@/store/AuthStore'
import { useUserStore } from '@/store/UserStore'
import { useSchoolStore } from '@/store/SchoolStore'
import { loginService } from '@/services/LoginService'
import { userService } from '@/services/UserService'
import { schoolService } from '@/services/SchoolService'
import {Ionicons} from "@expo/vector-icons";

const FaltsStats = ({navigation}: any) => {
    const {isAutenticated, setAuthState} = useAuthStore()
    const {user, setUser} = useUserStore()
    const {
        faultsStats, setFaultsStats,
        checkedLessonTwo, setCheckedLessonTwo,
        faultsStatsFiltered, setFaultsStatsFiltered
    } = useSchoolStore()
    const [visibleDialog, setVisibleDialog] = useState(false)
    const [pieData, setPieData] = useState<any[]>([])
    const [selectedPart, setSelectedPart] = useState(null)

    useEffect(() => {
        setFaultsStatsFiltered(undefined)
    }, [])

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

        const getFaultsStats = async(networkState: NetworkState, ra: number) => {
            let dataApi
            if (networkState.isConnected && ra != null) {
                dataApi = await schoolService.getFaultsStats(ra).then()
            }

            const faultsData = dataApi || faultsStats

            if (faultsData) {
                setFaultsStats(faultsData)
                setFaultsStatsFiltered(faultsData[checkedLessonTwo - 1])
            }
        }

        getNetworkStateAsync().then(
            (networkState) =>
                checkAuthState(networkState).then((autenticated) => {
                    if(autenticated) getUserData(networkState).then((ra) => getFaultsStats(networkState, ra))
                })
        )
    }, [])

    const handleSegmentPress = (segment: any) => {
        setSelectedPart(segment)
    }

    const hideDialog = () => {
        setVisibleDialog(false)
        setSelectedPart(null)
    }

    useEffect(() => {
        setFaultsStatsFiltered(faultsStats?.filter((item: any) => {
            const faltsPercent = faultsStats[checkedLessonTwo - 1].percentFalts ? faultsStats[checkedLessonTwo - 1].percentFalts : 0.0
            const presentPercent = 100.0 - faltsPercent

            setPieData([
                { value: presentPercent, color: '#58C878', text: `${presentPercent}%`, type: 'p' },
                { value: faltsPercent, color: '#ed1919', text: `${faltsPercent}%`, type: 'f' }
            ])

            return (faultsStats[checkedLessonTwo - 1]?.lessonAbr === item?.lessonAbr)
        })[0])
    }, [visibleDialog, faultsStatsFiltered])

    return (
        <View style={{ flex: 1, backgroundColor: '#663399' }}>
            {faultsStats == null ? (
                <View style={{ width: '100%', height: '20%', paddingTop: 40, paddingHorizontal: 30 }}>
                    <Skeleton
                        LinearGradientComponent={LinearGradient}
                        animation="wave"
                        style={{ borderRadius: 10 }}
                        height='90%'
                    />
                </View>
            ) : faultsStatsFiltered == undefined ? (
                <>
                    <View style={{ width: '100%', height: '20%', paddingTop: 40, paddingHorizontal: 30 }}>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>Faltas</Text>
                        <View style={{ width: '50%', gap: 5 }}>
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
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '100%', height: '96%' }}>
                            <ScrollView style={{ paddingTop: 80 }}>
                                <View style={{ width: '100%', height: '76%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 }}>Resumo Geral</Text>
                                    <View style={{ width: '60%', height: '20%', backgroundColor: '#58C878', borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingVertical: 15, marginBottom: 20 }}>
                                        <Skeleton
                                            LinearGradientComponent={LinearGradient}
                                            animation='wave'
                                            style={{ borderRadius: 20 }}
                                            height={108}
                                        />
                                    </View>
                                    <View style={{ width: '60%', height: '20%', backgroundColor: '#58C878', borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingVertical: 15, marginBottom: 20 }}>
                                        <Skeleton
                                            LinearGradientComponent={LinearGradient}
                                            animation='wave'
                                            style={{ borderRadius: 20 }}
                                            height={108}
                                        />
                                    </View>
                                    <View style={{ width: '60%', height: '20%', backgroundColor: '#58C878', borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingVertical: 15, marginBottom: 20 }}>
                                        <Skeleton
                                            LinearGradientComponent={LinearGradient}
                                            animation='wave'
                                            style={{ borderRadius: 20 }}
                                            height={108}
                                        />
                                    </View>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 }}>Meu Progresso</Text>
                                    <Skeleton
                                        LinearGradientComponent={LinearGradient}
                                        animation='wave'
                                        style={{ borderRadius: 90 }}
                                        width={160}
                                        height={160}
                                    />
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <View style={{ width: '86%', height: '20%', paddingTop: 40, paddingHorizontal: 30 }}>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>Faltas</Text>
                        <View style={{ width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View style={{ width: '100%', height: '100%' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 5 }}>{faultsStatsFiltered?.lessonAbr}</Text>
                                <Text style={{ fontSize: 18, color: '#fff', marginBottom: 5 }}>{faultsStatsFiltered?.classDesc + ' - ' + faultsStatsFiltered?.curseAbr}</Text>
                                <Text style={{ fontSize: 18, color: '#fff', marginBottom: 5 }}>{'Prof. ' + faultsStatsFiltered?.professorSurname}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                <Ionicons
                                    name='filter-circle'
                                    size={36}
                                    color='white'
                                    style={{ marginRight: 10 }}
                                    onPress={() => setVisibleDialog(true) }
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '100%', height: '86%' }}>
                            <ScrollView style={{ paddingTop: 80 }}>
                                <View style={{ width: '100%', height: '76%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 }}>Resumo Geral</Text>
                                    <View style={{ width: '60%', height: '20%', backgroundColor: '#58C878', borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingVertical: 15, marginBottom: 20 }}>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 10 }}>Total de Chamadas</Text>
                                        <View style={{ width: '20%', height: '70%', backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1E1E1E', textAlign: 'center' }}>{faultsStatsFiltered?.totalCalls}</Text>
                                        </View>
                                    </View>
                                    <View style={{ width: '60%', height: '20%', backgroundColor: '#58C878', borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingVertical: 15, marginBottom: 20 }}>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 10 }}>Total de Faltas</Text>
                                        <View style={{ width: '20%', height: '70%', backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1E1E1E', textAlign: 'center' }}>{faultsStatsFiltered?.totalFalts}</Text>
                                        </View>
                                    </View>
                                    <View style={{ width: '60%', height: '20%', backgroundColor: '#58C878', borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingVertical: 15, marginBottom: 30 }}>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E1E1E', textAlign: 'center', marginBottom: 10 }}>Máx. Faltas Permitidas</Text>
                                        <View style={{ width: '20%', height: '70%', backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1E1E1E', textAlign: 'center' }}>{faultsStatsFiltered?.maxFalts}</Text>
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 }}>Meu Progresso</Text>
                                    <PieChart
                                        radius={86}
                                        innerRadius={60}
                                        innerCircleColor='#663399'
                                        centerLabelComponent={() => {
                                            return (
                                                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                                    {selectedPart ? (
                                                        <Text style={{fontSize: 22, color: 'white', fontWeight: 'bold'}}>
                                                        {selectedPart ? `${selectedPart.value}%` : 'Clique em'}
                                                        </Text>
                                                    ) : (
                                                        <Text style={{fontSize: 14, color: 'white', fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 10, paddingTop: 20 }}>
                                                            Clique em uma parte
                                                        </Text>
                                                    )}
                                                    <Text style={{fontSize: 14, color: 'white'}}>{selectedPart ? selectedPart?.type == 'p' ? 'de Presenças' : 'de Faltas' : ''}</Text>
                                                </View>
                                            );
                                        }}
                                        donut
                                        showGradient
                                        sectionAutoFocus
                                        data={pieData}
                                        onPress={handleSegmentPress}
                                    />
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </>
            )}
            {visibleDialog && (
                <Dialog
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    isVisible={visibleDialog}
                    onBackdropPress={hideDialog}>
                    <Dialog.Title title='Selecione a Disciplina' />
                    {faultsStats?.map((faults, index) => (
                        <CheckBox
                            key={index}
                            title={faults?.lessonName}
                            containerStyle={{ backgroundColor: 'white', borderWidth: 0 }}
                            checked={checkedLessonTwo === index + 1}
                            onPress={() => {
                                setCheckedLessonTwo(index + 1)
                            }}
                        />
                    ))}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3690da', textAlign: 'center', marginEnd: 14 }}
                              onPress={hideDialog}>
                            FECHAR
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3690da', textAlign: 'center' }}
                              onPress={hideDialog}>
                            CONFIRMAR
                        </Text>
                    </View>
                </Dialog>
            )}
        </View>
    )
}

export default FaltsStats