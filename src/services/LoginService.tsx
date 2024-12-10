import axios from 'axios'
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV({ id: `${process.env.EXPO_PUBLIC_ID_MMKV}` })

class LoginService {
    readonly saveBearerTokenInStorage = (token: string) => {
        try {
            storage.set('accessToken', token)
        } catch (error) {
            console.log('Erro ao salvar o token no storage: ', error)
            throw error
        }
    }

    readonly getBearerTokenFromStorage = () => {
        try {
            return storage.getString('accessToken')
        } catch (error) {
            console.log('Erro ao buscar o token no storage: ', error)
            throw error
        }
    }

    readonly checkTokenIsPresent = () => {
        try {
            return storage.contains('accessToken')
        } catch (error) {
            console.log('Erro ao verificar se o token esta no storage: ', error)
        }
        return false
    }

    readonly logout = () => {
        try {
            storage.clearAll()
        } catch (error) {
            console.log('Erro ao deletar o token no storage: ', error)
            throw error
        }
    }

    readonly login = async(email: string, password: string) => {
        try {
            const response = await axios.post(
            `${process.env.EXPO_PUBLIC_JAVA_API_URL}/auth/login`,
            {email, password},
            {timeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT)}
            )

            if(response?.data && response.data.accessToken) {
                this.saveBearerTokenInStorage(response.data.accessToken)
                return response.data.accessToken
            }
        } catch (error) {
            console.log('Erro ao consumir a api para realizar o login: ', error)
            throw error
        }
        return null
    }

    readonly checkTokenExists = async() => {
        try {
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_JAVA_API_URL}/auth/checkToken`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.getBearerTokenFromStorage()}`
                    },
                    timeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT)
                })

            if(response?.data && response.data.exists) {
                return response.data.exists
            }
        } catch (error) {
            console.log('Erro ao verificar se o token existe: ', error)
            throw error
        }
        return null
    }

    readonly defineInterceptor = () => {
        axios.interceptors.response.use(response => response, async error => {
            if (error.response.status === 401 && !error.config._retry) {
                error.config._retry = true
                try {
                    const response = await axios.post(
                    `${process.env.EXPO_PUBLIC_JAVA_API_URL}/auth/refreshToken`,
                    {accessToken: this.getBearerTokenFromStorage()},
                    {timeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT)})

                    if(response?.data) {
                        this.saveBearerTokenInStorage(response.data.refreshToken)
                        error.config.headers["Authorization"] = `Bearer ${response.data.refreshToken}`
                        return await axios(error.config)
                    }
                } catch (reject) {
                    return await Promise.reject(error)
                }
            }
            return Promise.reject(error)
        })
    }
}

const loginService = new LoginService()
export { loginService }