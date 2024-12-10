import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import Home from '@/screens/Home'
import History from '@/screens/History'
import FaltsStats from '@/screens/FaltsStats'
import Logout from '@/screens/Logout'
import { useUserStore } from '@/store/UserStore'

const Tab = createBottomTabNavigator()

const TabsNavigator = () => {
    const {user} = useUserStore()

    return (
        <Tab.Navigator
            initialRouteName='Home'
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#663399',
                    borderTopWidth: 0,
                    height: 62,
                },
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: '#dcd7db',
                tabBarLabelStyle: {
                    fontSize: 16,
                },
            }}>
            <Tab.Screen
                name='Home'
                component={Home}
                options={{
                    tabBarIcon: (props) =>
                        <Ionicons
                            name='home'
                            size={26}
                            color={props.focused ? 'white' : '#dcd7db'}
                            style={{ marginTop: 4 }}
                        />,
                }}
            />
            <Tab.Screen
                name= {user.role == 'P' ? 'Chamadas' : 'Presenças'}
                component={History}
                options={{
                    tabBarIcon: (props) =>
                        <Ionicons
                            name='calendar'
                            size={26}
                            color={props.focused ? 'white' : '#dcd7db'}
                            style={{ marginTop: 4 }}
                        />,
                }}
            />
            {user?.role == 'A' &&
                <Tab.Screen
                    name='Faltas'
                    component={FaltsStats}
                    options={{
                        tabBarIcon: (props) =>
                            <Ionicons
                                name='stats-chart'
                                size={26}
                                color={props.focused ? 'white' : '#dcd7db'}
                                style={{ marginTop: 4 }}
                            />,
                    }}
                />
            }
            <Tab.Screen
                name='Sair'
                component={Logout}
                options={{
                    tabBarIcon: (props) =>
                        <Ionicons
                            name='log-out'
                            size={26}
                            color={props.focused ? 'white' : '#dcd7db'}
                            style={{ marginTop: 4 }}
                        />,
                }}
            />
        </Tab.Navigator>
    )
}

export default TabsNavigator