import { useEffect,useState } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { loginService } from '@/services/LoginService'

const Logout = ({ navigation }: any) => {
    useEffect(() => {
        setTimeout(() => {
            loginService.logout()
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