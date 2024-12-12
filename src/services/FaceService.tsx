import { MMKV } from 'react-native-mmkv'
import configureRekognition from './AwsConfig'

const storage = new MMKV({ id: `${process.env.EXPO_PUBLIC_ID_MMKV}` })

class FaceService {
    readonly detectFaces = async(imageBytes: Buffer) => {
        try {
            const rekognition = await configureRekognition()
            const params = {
                Image: { Bytes: imageBytes },
            }
            return await rekognition?.detectFaces(params).promise()
        } catch (error) {
            console.log('Erro ao detectar rostos: ', error)
            return null
        }
    }

    readonly searchFaceByImage = async (collectionId: string, imageBytes: Buffer) => {
        try {
            const rekognition = await configureRekognition()
            const params = {
                CollectionId: collectionId,
                Image: { Bytes: imageBytes },
                MaxFaces: 1,
                FaceMatchThreshold: 80,
            }
            return await rekognition?.searchFacesByImage(params).promise()
        } catch (error) {
            console.log('Erro ao procurar rostos: ', error)
            return null
        }
    }

    readonly createCollection = async (collectionId: string) => {
        try {
            const rekognition = await configureRekognition()
            const params = {
                CollectionId: collectionId,
            }
            return await rekognition?.createCollection(params).promise()
        } catch (error) {
            console.log('Erro ao criar coleção: ', error)
            return null
        }
    }

    readonly listCollections = async () => {
        try {
            const rekognition = await configureRekognition()
            const params = {
                MaxResults: 100,
            }
            return await rekognition?.listCollections(params).promise()
        } catch (error) {
            console.log('Erro ao listar coleções: ', error)
            return null
        }
    }

    readonly findCollectionExists = async (collectionId: string) => {
        const collections = await this.listCollections()
        const collectionFound = collections?.CollectionIds?.find(id => id === collectionId)
        return collectionFound != null
    }

    readonly listFacesInCollection = async (collectionId: string) => {
        try {
            const rekognition = await configureRekognition()
            const params = {
                CollectionId: collectionId,
                MaxResults: 60,
            }
            return await rekognition?.listFaces(params).promise()
        } catch (error) {
            console.log('Erro ao listar rostos: ', error)
            return null
        }
    }

    readonly indexFaces = async (collectionId: string, imageBytes: Buffer, ra : string) => {
        try {
            const rekognition = await configureRekognition()
            const params = {
                CollectionId: collectionId,
                Image: { Bytes: imageBytes },
                ExternalImageId: ra
            }
            return await rekognition?.indexFaces(params).promise()
        } catch (error) {
            console.log("Erro ao indexar rostos: ", error)
            return null
        }
    }

    readonly deleteCollection = async (collectionId: string) => {
        try {
            const rekognition = await configureRekognition()
            const params = {
                CollectionId: collectionId,
            }
            return await rekognition?.deleteCollection(params).promise()
        } catch (error) {
            console.log("Erro ao deletar coleção: ", error)
        }
    }
}

const faceService = new FaceService()
export { faceService }