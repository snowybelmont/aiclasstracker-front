import axios from 'axios'
import {MMKV} from 'react-native-mmkv'
import RNFS from 'react-native-fs'
import {Buffer as B} from 'buffer'
import {FaceDetailList} from 'aws-sdk/clients/rekognition'
import { faceService } from '@/services/FaceService'
import { loginService } from '@/services/LoginService'
import { schoolService } from '@/services/SchoolService'

const storage = new MMKV({ id: `${process.env.EXPO_PUBLIC_ID_MMKV}` })

class CameraService {
    readonly deleteImageFromDeviceCache = async(photoPath: string) => {
        try {
            await RNFS.unlink(photoPath)
        } catch (error) {
            console.log('Erro ao excluir foto do dispositivo:', error)
        }
    }

    readonly convertImagemToBuffer = async(photoPath: string) => {
        try {
            const imageBase64 = await RNFS.readFile(photoPath, 'base64')
            return B.from(imageBase64, 'base64')
        } catch (error) {
            console.log('Erro ao converter imagem em bytes: ', error)
        }
    }

    readonly getBase64FromImage = async(photoPath: string) => {
        try {
            return await RNFS.readFile(photoPath, 'base64')
        } catch (error) {
            console.log('Erro ao converter imagem em bytes: ', error)
        }
    }

    readonly sendPhotoToDetectFaces = async(photoPath: string) => {
        try {
            /*
            await faceService.deleteCollection('6semesterGTI-29-11-2024')
            await faceService.deleteCollection('NEGELETRONIC6semesterGTI-29-11-2024')
            await faceService.deleteCollection('PROJTIII6semesterGTI-29-11-2024')
            await faceService.deleteCollection('TOPAVANCEMTI6semesterGTI-11-12-2024')
            console.log(await faceService.listCollections())

            return null*/

            const imageBytes = await this.convertImagemToBuffer(photoPath)

            if(imageBytes == undefined) {
                return {validation: {title: 'Imagem invalida', message: 'Ocorreu um erro ao processar a imagem'}}
            }

            const facesDetected = await faceService.detectFaces(imageBytes)

            if(facesDetected == null || facesDetected?.FaceDetails?.length == 0) {
                return {validation: {title: 'Nenhum rosto detectado', message: 'Não foi identificado nenhum rosto na imagem'}}
            }

            return facesDetected
        } catch (error) {
            console.log('Erro ao detectar rostos na foto')
            return {validation: {title: 'Erro ao detectar rostos', message: 'Não foi possível detectar os rosto na imagem'}}
        }
    }

    readonly getFacesBoundings = (facesDetails: FaceDetailList) => {
        const facesBounding = []
        for(const faceDetail of facesDetails) {
            facesBounding.push(faceDetail?.BoundingBox)
        }

        return facesBounding
    }

    readonly sendImageToResize = async (data : { imageBase64 : string; facesBounding: any[] }) => {
        try {
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_JAVA_API_URL}/image/resize`,
                data, {
                    headers: {
                        'Authorization': `Bearer ${loginService.getBearerTokenFromStorage()}`
                    },
                    timeout: Number(process.env.EXPO_PUBLIC_JAVA_API_TIMEOUT)
                })

            if(response?.data) {
                return response.data
            }
        } catch (error) {
            console.log('Erro ao redimensionar a imagem', error)
        }
        return null
    }

    readonly sendFacesToSearch = async (facesBase64 : string[]) => {
        let searchSucess = 0
        let searchError = 0
        let searchNotFound = 0
        let errorsMessage= []
        let facesInClass = []
        for(const faceBase64 of facesBase64) {
            try {
                const resizedImageBytes = B.from(faceBase64, 'base64')
                const facesFound = await faceService.searchFaceByImage(process.env.EXPO_PUBLIC_AWS_STORAGE_COLLECTION_ID, resizedImageBytes)

                if (facesFound == null || !facesFound.FaceMatches || facesFound?.FaceMatches?.length == 0) {
                    searchNotFound++
                    continue
                }

                facesInClass.push({Face: facesFound?.FaceMatches[0]?.Face, resizedImage: resizedImageBytes})
                searchSucess++
            } catch (error) {
                console.log('Erro ao procurar rostos no storage: ', error)
                searchError++
            }
        }

        if(searchNotFound > 1) {
            errorsMessage.push({validation: {title: 'Alunos não localizados', message: `${searchNotFound} alunos não localizado na turma`}})
        } else if(searchNotFound == 1) {
            errorsMessage.push({validation: {title: 'Aluno não localizado', message: `Um dos aluno não foi localizado na turma`}})
        }

        if(searchError > 0) {
            errorsMessage.push({validation: {title: 'Erro ao buscar o rosto', message: `Não foi possível buscar o rosto de ${searchError} alunos na turma`}})
        }

        return {searchSucess, searchError, searchNotFound, errorsMessage, facesInClass}
    }

    readonly getUpcomingLesson = async() => {
        try {
            const dailyLessons = schoolService.getDailyLessonsFromStorage()
            return dailyLessons.find((dailyLesson: any) => {
                const now = new Date().getHours() * 60 + new Date('2022-01-01T21:30:00.000Z').getMinutes()
                const [startHour, startMinutes] = dailyLesson.time.split(' - ')[0].split(':').map(Number)
                const [endHour, endMinutes] = dailyLesson.time.split(' - ')[1].split(':').map(Number)

                const timeStartLesson = startHour * 60 + startMinutes
                const timeEndLesson = endHour * 60 + endMinutes

                return now < timeStartLesson && now < timeEndLesson
            })
        } catch (error) {
            console.log('Erro ao obter o nome da coleção: ', error)
            return null
        }
    }

    readonly getCollectionName = async() => {
        try {
            const date = new Date()
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()

            const upcomingLesson = await this.getUpcomingLesson()

            if(upcomingLesson == null) {
                return null
            }

            return `${upcomingLesson?.lessonAbr?.replace(/[^a-zA-Z]/g, "")}${upcomingLesson?.semester}semester${upcomingLesson?.curseAbr}-${day}-${month}-${year}`
        } catch (error) {
            console.log('Erro ao obter o nome da coleção: ', error)
            return null
        }
    }

    readonly getDailyCollectionId = async() => {
        try {
            const collectionName = await this.getCollectionName()

            if(collectionName == null) {
                return {validation: {title: 'Erro ao preparar para registrar presença', message: 'Ocorreu um erro ao preparar para registrar a presença do aluno, tente novamente mais tarde'}}
            }

            const collectionExists = await faceService.findCollectionExists(collectionName)

            if(!collectionExists) {
                const collection = await faceService.createCollection(collectionName)

                if(collection == null || collection?.StatusCode !== 200) {
                    return {validation: {title: 'Erro ao preparar para registrar presença', message: 'Ocorreu um erro ao preparar para registrar a presença do aluno, tente novamente mais tarde'}}
                }
            }

            return collectionName
        } catch (error) {
            console.log('Não foi possivel obter o nome da coleção: ', error)
            return {validation: {title: 'Erro ao preparar para registrar presença', message: 'Ocorreu um erro ao preparar para registrar a presença do aluno, tente novamente mais tarde'}}
        }
    }

    readonly saveFacesInDailyCollection = async(collectionId: string, faces: any[]) => {
        let saveSucess = 0
        let saveError = 0
        let facesAlredySaved = 0
        let studentsSaved = []
        let studentsAlredySaved = []
        let studentsWithError = []
        try {
            const facesInCollection = await faceService.listFacesInCollection(collectionId)

            for(const face of faces) {
                try {
                    let studentAlredyRegistered = false
                    for (const faceInCollection of facesInCollection?.Faces) {
                        if (faceInCollection?.ExternalImageId === face?.Face?.ExternalImageId) {
                            studentAlredyRegistered = true
                            break
                        }
                    }

                    if (studentAlredyRegistered) {
                        studentsAlredySaved.push(face?.Face?.ExternalImageId)
                        faceAlredySaved++
                        continue
                    }

                    await faceService.indexFaces(collectionId, face?.resizedImage, face?.Face?.ExternalImageId)
                    studentsSaved.push(face?.Face?.ExternalImageId)
                    saveSucess++
                } catch (error) {
                    console.log('Erro ao salvar rostos dos alunos: ', error)
                    studentsWithError.push(face?.Face?.ExternalImageId)
                    saveError++
                }
            }
        } catch (error) {
            console.log('Erro ao obter rostos na coleção: ', error)
            saveError++
        }

        return {saveSucess, saveError, facesAlredySaved, studentsSaved, studentsAlredySaved, studentsWithError}
    }

    readonly saveStudentsInDatabase = async(professorRa: number, studentsRa: string[]) => {
        try {
            const upcomingLesson = await this.getUpcomingLesson()
            const dataInfo = {
                lessonAbr: upcomingLesson?.lessonAbr,
                curseAbr: upcomingLesson?.curseAbr,
                day: upcomingLesson?.day,
                time: upcomingLesson?.time,
                semester: upcomingLesson?.semester,
                studentsRa
            }
            const students = await schoolService.saveCall(professorRa, dataInfo)

            if(students == null) {
                return {validation: {title: 'Erro ao registrar presenças', message: 'Ocorreu um erro ao tentar registrar as presenças, tente novamente mais tarde'}}
            }

            return students
        } catch (error) {
            console.log('Erro ao salvar as presenças no banco: ', error)
            return {validation: {title: 'Erro ao registrar presenças', message: 'Ocorreu um erro ao tentar registrar as presenças, tente novamente mais tarde'}}
        }
    }
}

const cameraService = new CameraService()
export { cameraService }