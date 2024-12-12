import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import StackNavigator from '@/routes/Stack'
import { loginService } from '@/services/LoginService'

export default function App() {
    loginService.defineInterceptor()

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <NavigationContainer>
              <StackNavigator />
              <StatusBar style='light' backgroundColor='#663399' />
          </NavigationContainer>
      </SafeAreaView>
    )
}
