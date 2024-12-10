import React, { useEffect, useState } from 'react'
import { getNetworkStateAsync, NetworkState } from 'expo-network'
import {View, Text, ScrollView, ActivityIndicator} from 'react-native'
import { Skeleton, ListItem, Avatar, Dialog, CheckBox } from '@rneui/themed'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAuthStore } from '@/store/AuthStore'
import { useUserStore } from '@/store/UserStore'
import { useSchoolStore } from '@/store/SchoolStore'
import { loginService} from '@/services/LoginService'
import { userService } from '@/services/UserService'
import { schoolService } from '@/services/SchoolService'

const History = ({ navigation }: any) => {
    const {isAutenticated, setAuthState} = useAuthStore()
    const {user, setUser} = useUserStore()
    const {
        history, setHistory,
        lessonsList, setLessonsList,
        checkedLessonOne, setCheckedLessonOne,
        date, setDate,
        historyFiltered, setHistoryFiltered
    } = useSchoolStore()
    const [visibleDialog, setVisibleDialog] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)

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

        const getHistory = async(networkState: NetworkState, ra: number) => {
            let dataApi
            if (networkState.isConnected && ra != null) {
                dataApi = await schoolService.getHistory(ra).then()
            }

            const historyData = dataApi || history

            if (historyData) {
                const lessonsToAdd = [] as any
                const lessonsAlredyAdded = new Set()

                historyData.forEach((lesson: any) => {
                    if (!lessonsAlredyAdded.has(lesson.lessonAbr)) {
                        lessonsToAdd.push({ name: lesson.lessonAbr })
                        lessonsAlredyAdded.add(lesson.lessonAbr)
                    }
                })

                setLessonsList(lessonsToAdd)
                setHistory(historyData)
            }
        }

        getNetworkStateAsync().then(
            (networkState) =>
                checkAuthState(networkState).then((autenticated) => {
                    if(autenticated) getUserData(networkState).then((ra) => getHistory(networkState, ra))
                })
        )
    }, [])

    const onChange = (event: any, selectedDate: Date) => {
        const currentDate = selectedDate || date
        setShowDatePicker(false)
        setDate(currentDate)
    }

    useEffect(() => {
        setHistoryFiltered(history?.filter((item: any) => {
            const dataApiDate = new Date(item?.callDate)
            return (history[checkedLessonOne - 1]?.lessonAbr === item?.lessonAbr) && (dataApiDate.getFullYear() === date.getFullYear() && dataApiDate.getMonth() + 1 === date.getMonth() + 1 && dataApiDate.getDate() === date.getDate())
        }))
    }, [date, visibleDialog])

    return (
        <View style={{ flex: 1, backgroundColor: '#663399', paddingTop: 40, paddingHorizontal: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>
                    {user?.role == 'P' ? 'Histórico de Chamadas' : 'Histórico de Presença'}
                </Text>
                {history != null && (
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons
                            name='filter-circle'
                            size={36}
                            color='white'
                            style={{ marginRight: 10 }}
                            onPress={() => setVisibleDialog(true) }
                        />
                        <Ionicons
                            name='calendar-number'
                            size={36}
                            color='white'
                            style={{ marginRight: 10 }}
                            onPress={() => setShowDatePicker(true) }
                        />
                    </View>
                )}
            </View>
            {history == null ? (
                <Skeleton
                    LinearGradientComponent={LinearGradient}
                    animation="wave"
                    style={{ borderRadius: 10 }}
                    height='90%'
                />
            ) : historyFiltered?.length == 0 ? (
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 20}}>
                    {user?.role == 'P' ? 'Nenhuma chamada encontrada' : 'Nenhuma presença encontrada'}
                </Text>
            ) : (
                <>
                    <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#ddd', justifyContent: 'space-between', paddingBottom: 10, paddingEnd: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{user?.role == 'P' ? 'Lista de Alunos' : 'Lista de Aulas'}</Text>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>Presente</Text>
                    </View>
                    <View style={{ height: '86%', marginTop: 10 }}>
                        <ScrollView>
                            {historyFiltered?.map((hist, index: number) => {
                                const dateHist = new Date(hist?.callDate)
                                const formattedDate = (dateHist.getDate() > 9 ? dateHist.getDate() : '0' + dateHist.getDate()) + '/' + (dateHist.getMonth() + 1) + '/' + dateHist.getFullYear()
                                const formattedTime = dateHist.getHours() + ':' + dateHist.getMinutes()
                                const nameParts = hist?.userName.split(' ')
                                const alias = nameParts[0].substring(0, 1) + '' + nameParts[nameParts.length - 1].substring(0, 1)

                                return (
                                    <ListItem key={index} bottomDivider style={{ borderBottomColor: '#ddd' }} containerStyle={{ backgroundColor: 'transparent' }}>
                                        {user?.role == 'P' &&
                                            <Avatar
                                                rounded
                                                size={40}
                                                containerStyle={{ borderColor: 'white', borderWidth: 1 }}
                                                titleStyle={{ margin: 5, color: '#1E1E1E' }}
                                                title={alias}
                                                source={{ uri: 'data:image/jpeg;base64,' + hist?.userPhoto }}
                                            />
                                        }
                                        <ListItem.Content>
                                            <ListItem.Title style={{ width: '80%', fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                                                {user?.role == 'P' ? hist?.userName : formattedDate + ' ' + formattedTime}
                                            </ListItem.Title>
                                            {user?.role == 'A' &&
                                                <ListItem.Subtitle style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                                                    {hist?.lessonAbr}
                                                </ListItem.Subtitle>
                                            }
                                            <ListItem.Subtitle style={{ fontSize: 16, color: '#fff' }}>
                                                {user?.role == 'P' ? 'Matrícula: ' + hist?.ra : hist?.classDesc + ' - ' +  hist?.curseAbr}
                                            </ListItem.Subtitle>
                                            {user?.role == 'A' &&
                                                <ListItem.Subtitle style={{ fontSize: 16, color: '#fff' }}>
                                                    {'Prof. ' + hist?.userName}
                                                </ListItem.Subtitle>
                                            }
                                        </ListItem.Content>
                                        <Ionicons
                                            style={{ marginRight: '3%' }}
                                            size={30}
                                            color='white'
                                            name={hist.havePresence ? 'checkmark-circle' : 'close-circle'}
                                        />
                                    </ListItem>
                                )
                            })}
                        </ScrollView>
                    </View>
                </>
            )}
            {visibleDialog && (
                <Dialog
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    isVisible={visibleDialog}
                    onBackdropPress={() => setVisibleDialog(false)}>
                    <Dialog.Title title='Selecione a Disciplina' />
                    {lessonsList?.map((lesson, index) => (
                        <CheckBox
                            key={index}
                            title={lesson?.name}
                            containerStyle={{ backgroundColor: 'white', borderWidth: 0 }}
                            checked={checkedLessonOne === index + 1}
                            onPress={() => {
                                setCheckedLessonOne(index + 1)
                            }}
                        />
                    ))}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3690da', textAlign: 'center', marginEnd: 14 }}
                            onPress={() => setVisibleDialog(false)}>
                            FECHAR
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3690da', textAlign: 'center' }}
                              onPress={() => setVisibleDialog(false)}>
                            CONFIRMAR
                        </Text>
                    </View>
                </Dialog>
            )}
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode={'date'}
                    is24Hour={true}
                    display='default'
                    onChange={onChange}
                />
            )}
        </View>
    )
}

export default History