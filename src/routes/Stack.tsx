import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Login from '@/screens/Login'
import TabsNavigator from '@/routes/Tabs'
import Camera from '@/screens/Camera'

const Stack = createNativeStackNavigator()

const StackNavigator = () => {
    return (
        <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Login' component={Login} />
            <Stack.Screen name='Tabs' component={TabsNavigator} />
            <Stack.Screen name='Camera' component={Camera} />
        </Stack.Navigator>
    )
}

export default StackNavigator
