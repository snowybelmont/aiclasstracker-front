import React, { useEffect, useState } from 'react'
import { getNetworkStateAsync, NetworkState } from 'expo-network'
import { ActivityIndicator, Text, View } from 'react-native'
import { Button, Input } from '@rneui/base'
import { Dialog } from '@rneui/themed'
import { loginService } from '@/services/LoginService'
import { userService } from '@/services/UserService'
import { useAuthStore } from '@/store/AuthStore'

const Login = ({ navigation, route }: any) => {
    const [loading, setIsLoading] = useState<boolean>(true)
    const {isAutenticated, setAuthState} = useAuthStore()
    const sessionExpired = route?.params?.sessionExpired
    const [emailValue, setEmailValue] = useState<string>('')
    const [passwordValue, setPasswordValue] = useState<string>('')
    const [passwordVisible, setIsPasswordVisible] = useState<boolean>(false)
    const [error, setError] = useState<{email?: string; password?: string, login?: {title: string; message: string}}>({})

    useEffect(() => {
        const checkAuthState = async(networkState: NetworkState) => {
            let tokenExists = true
            if(networkState.isConnected && isAutenticated) {
                tokenExists = await loginService.checkTokenExists()
            }

            if(isAutenticated && tokenExists) {
                setAuthState(true)
                navigation.reset({index: 0, routes: [{name: 'Tabs'}]})
                return
            }
            setAuthState(false)
        }

        getNetworkStateAsync().then(
            (networkState) => {
                checkAuthState(networkState).finally(() => setIsLoading(false))
            }
        )
    }, [])

    const validateFields = () => {
        const errors = {} as {email?: string; password?: string}
        if(emailValue == '') errors.email = 'Email é obrigatório'
        else {
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if(!regex.test(emailValue)) errors.email = 'Email inválido'
        }
        if(passwordValue == '') errors.password = 'Senha é obrigatório'

        setError(errors)
        return !errors.email && !errors.password
    }

    const handleLogin = async () => {
        if(validateFields()) {
            try {
                setIsLoading(true)
                const accessToken = await loginService.login(emailValue, passwordValue)

                if(accessToken) {
                    await userService.getUser()
                    setAuthState(true)
                    navigation.reset({index: 0, routes: [{name: 'Tabs'}]})
                }

                setError({login: {title: 'Erro ao realizar login', message: 'Um erro inesperado aconteceu. Tente novamente mais tarde'}})
            } catch (error: any) {
                if(error?.status !== undefined) {
                    setError({login: {title: 'Erro ao realizar login', message: error.response.data.message}})
                    return
                }

                setError({login: {title: 'Erro ao realizar login', message: 'Um erro inesperado aconteceu. Tente novamente mais tarde'}})
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#663399', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28, color: '#fff', marginBottom: 20 }}>
                Bem Vindo
            </Text>
            <View style={{ marginBottom: 20 }}>
                <View style={{ width: '80%', marginBottom: error.email ? 34 : 12 }}>
                    <Input
                        placeholderTextColor='#1E1E1E'
                        cursorColor='#1E1E1E'
                        containerStyle={{ width: '100%', height: 60, borderRadius: 10, backgroundColor: '#58C878' }}
                        inputContainerStyle={{ width: '100%', height: 60, borderBottomWidth: 0 }}
                        errorStyle={
                            error && error.email
                                ? { fontSize: 15, color: '#FFB300', marginBottom: 10 }
                                : { margin: 0 }
                        }
                        placeholder='Email'
                        value={emailValue}
                        onChangeText={(email) => {setEmailValue(email); setError({ ...error, email: '' })}}
                        errorMessage={error.email}
                    >
                    </Input>
                </View>
                <View style={{ width: '80%', marginBottom: error.password ? 20 : 0 }}>
                    <Input
                        placeholderTextColor='#1E1E1E'
                        cursorColor='#1E1E1E'
                        containerStyle={{ width: '100%', height: 60, borderRadius: 10, backgroundColor: '#58C878' }}
                        inputContainerStyle={{ width: '100%', height: 60, borderBottomWidth: 0 }}
                        rightIcon={{
                            type: 'font-awesome',
                            name: passwordVisible ? 'eye-slash' : 'eye',
                            iconProps: {
                                name: passwordVisible ? 'eye-slash' : 'eye',
                                color: '#1E1E1E',
                                size: 30,
                                style: { marginRight: 15 },
                                onPress: () => setIsPasswordVisible(!passwordVisible),
                            },
                        }}
                        errorStyle={
                            error && error.password
                                ? { fontSize: 15, color: '#FFB300' }
                                : { margin: 0 }
                        }
                        placeholder='Senha'
                        value={passwordValue}
                        onChangeText={(password) => {setPasswordValue(password); setError({ ...error, password: '' })}}
                        secureTextEntry={!passwordVisible}
                        errorMessage={error.password}
                    >
                    </Input>
                </View>
            </View>
            <Button
                containerStyle={{ width: '50%' }}
                buttonStyle={{ height: 55, borderRadius: 10, backgroundColor: '#58C878' }}
                titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#1E1E1E' }}
                loadingProps={{ size: 28, color: '#1E1E1E' }}
                title='Entrar'
                onPress={handleLogin}
            />
            {error.login && (
                <Dialog
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    isVisible={!!error.login}
                    onBackdropPress={() => setError({})}
                >
                    <Dialog.Title title={error.login.title} />
                    <Text>{error.login.message}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3690da', textAlign: 'center', marginEnd: 14 }}
                              onPress={() => setError({})}>
                            FECHAR
                        </Text>
                    </View>
                </Dialog>
            )}
            {loading && (
                <Dialog
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    overlayStyle={{ height: '15%', justifyContent: 'center' }}
                    isVisible={loading}
                >
                    <ActivityIndicator size='large' color='#1E1E1E' />
                </Dialog>
            )}
            {sessionExpired && (
                <Dialog
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    isVisible={!!error.login}
                    onBackdropPress={() => setError({})}
                >
                    <Dialog.Title title='Sessão expirada' />
                    <Text>A sua sessão expirou, faça o login novamente</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3690da', textAlign: 'center', marginEnd: 14 }}
                              onPress={() => setError({})}>
                            FECHAR
                        </Text>
                    </View>
                </Dialog>
            )}
        </View>
    )
}

export default Login
