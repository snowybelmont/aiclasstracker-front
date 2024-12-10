import axios from 'axios'
import { MMKV } from 'react-native-mmkv'
import { loginService } from '@/services/LoginService'

const storage = new MMKV({ id: `classtracker` })

class UserService {
    readonly saveUserInStorage = (user: { ra: number; surname: string; role: string; message: string }) => {
        try {
            storage.set('userData', JSON.stringify(user))
        } catch (error) {
            console.log('Erro ao salvar o usuário no storage: ', error)
            throw error
        }
    }

    readonly getUserFromStorage = () => {
        try {
            const data = storage.getString('userData')
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.log('Erro ao obter o usuário do storage: ', error)
        }
        return null
    }

    readonly getUser = async() => {
        try {
            const response = await axios.get(
            `http://classtracker.online:8080/api/users/data`, {
                headers: {
                    'Authorization': `Bearer ${loginService.getBearerTokenFromStorage()}`
                },
                timeout: 10000
            })

            if(response?.data) {
                this.saveUserInStorage(response.data)
                return response.data
            }
        } catch (error) {
            console.log('Erro ao consumir a api para obter os dados do usuario: ', error)
        }
        return null
    }
}

const userService = new UserService()
export { userService }