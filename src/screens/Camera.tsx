import React, {useEffect, useRef, useState} from 'react'
import { useCameraDevice, useCameraPermission, useCameraFormat, Camera as RNVCamera } from 'react-native-vision-camera'
import {View, Text, ActivityIndicator} from 'react-native'
import { Button } from '@rneui/base'
import { Dialog } from '@rneui/themed'
import { cameraService } from '@/services/CameraService'
import { useUserStore } from '@/store/UserStore'

const Camera = ({navigation}: any) => {
    const cameraRef = useRef<RNVCamera>(null)
    const device = useCameraDevice('front')
    const { hasPermission, requestPermission } = useCameraPermission()
    const format = useCameraFormat(device, [
        { photoResolution: { width: 720, height: 1280 } }
    ])
    const {user} = useUserStore()
    const [error, setError] = useState<{validation?: {title: string; message: string}}>({})
    const [response, setResponse] = useState<{validation?: {title: string; message: string}}>({})
    const [cameraBusy, setCameraBusy] = useState<boolean>(false)

    useEffect(() => {
        requestPermission().then()
    }, [!hasPermission])

    const handleTakePhoto = async() => {
        setCameraBusy(true)
        const photo = await cameraRef.current?.takePhoto()

        if(photo == null) {
            setError({validation: {title: 'Erro ao tirar foto', message: 'Ocorreu um erro ao tirar a foto, tente novamente mais tarde'}})
            return
        }

        try {
            const responseDetect = await cameraService.sendPhotoToDetectFaces(photo.path)

            if(responseDetect?.validation) {
                setError(responseDetect)
                return
            }

            const facesBounding = cameraService.getFacesBoundings(responseDetect?.FaceDetails)

            if(facesBounding == undefined || facesBounding.length == 0) {
                setError({validation: {title: 'Erro ao extrair posição dos rostos', message: 'Não foi possível pegar a posição dos rostos identificados'}})
                return
            }

            const imageBase64 = await cameraService.getBase64FromImage(photo.path)

            if(imageBase64 == undefined) {
                setError({validation: {title: 'Erro ao preparar imagem', message: 'Não foi possível preparar a imagem para obter os rostos identificados'}})
                return
            }

            const facesBase64 = await cameraService.sendImageToResize({imageBase64, facesBounding})

            if(facesBase64 == null || facesBase64.length == 0) {
                setError({validation: {title: 'Erro ao obter rostos', message: 'Não foi possível obter os rostos identificados'}})
                return
            }

            const responseSearch = await cameraService.sendFacesToSearch(facesBase64)

            if(responseSearch?.searchSucess == 0 || responseSearch?.searchError > 0) {
                setError({validation: {title: 'Erro ao procurar alunos', message: 'Ocorreu um erro ao procurar os alunos, tente novamente mais tarde'}})
                return
            }

            const collectionId = await cameraService.getDailyCollectionId()

            if(collectionId?.validation) {
                setError(collectionId)
                return
            }

            const responseSave = await cameraService.saveFacesInDailyCollection(collectionId, responseSearch.facesInClass)

            if(responseSave?.saveSucess == 0 || responseSave?.saveError > 0) {
                setError({validation: {title: 'Erro ao salvar alunos', message: 'Ocorreu um erro ao salvar os alunos, tente novamente mais tarde'}})
                return
            }

            const responseApi = await cameraService.saveStudentsInDatabase(user?.ra, responseSave?.studentsSaved)

            if(responseApi?.length == 0) {
                setError({validation: {title: 'Erro ao salvar alunos', message: 'Ocorreu um erro ao salvar os alunos, tente novamente mais tarde'}})
                return
            }

            const detectedMessage = `Foram detectados ${responseDetect?.FaceDetails?.length} rostos, destes rostos\n\n`
            const sucessMessage = responseApi?.length == 0 ? '' : `${responseApi?.length} alunos foram salvos com sucesso\n`
            const erroeMessage = responseSave?.saveError == 0 ? '' : `${responseSave?.saveError} alunos foram não foram salvos\n`
            const notFoundMessage = responseSearch?.searchNotFound == 0 ? '' : `${responseSearch?.searchNotFound} alunos não foram encontrados\n`
            const alredySavedMessage = responseSave?.facesAlredySaved == 0 ? '' : `${responseSave?.facesAlredySaved} alunos já tiveram a presença registrada\n`

            setResponse(detectedMessage + sucessMessage + erroeMessage + notFoundMessage + alredySavedMessage)
        } catch (error) {
            console.log('Erro ao processar a foto tirada: ', error)
            setError({validation: {title: 'Erro ao processar a foto tirada', message: 'Ocorreu um erro ao processar a foto tirada, tente novamente mais tarde'}})
        } finally {
            await cameraService.deleteImageFromDeviceCache(photo.path)
            setCameraBusy(false)
        }
    }

    return (
        <>
            {!device || !hasPermission ? (
                <View style={{ flex: 1, backgroundColor: '#663399', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ width: '60%', fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 }}>
                        {!device
                            ? 'Não foi possível iniciar a câmera, tente novamente mais tarde'
                            : 'Sem permissão para acessar a câmera, habilite a camera e tente novamente'
                        }
                    </Text>
                    <Button
                        containerStyle={{ width: '40%' }}
                        buttonStyle={{ height: 55, borderRadius: 10, backgroundColor: '#58C878' }}
                        titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#1E1E1E' }}
                        loadingProps={{ size: 28, color: '#1E1E1E' }}
                        title='Voltar'
                        onPress={() => navigation.goBack()}
                    />
                </View>
                ) : (
                <View style={{ flex: 1 }}>
                    <RNVCamera
                        style={{ width: '100%', height: '100%' }}
                        ref={cameraRef}
                        device={device}
                        format={format}
                        isActive={device && hasPermission}
                        photo={true}
                        resizeMode={'cover'}
                        photoQualityBalance={'speed'}
                    />

                    <Button
                        containerStyle={{ width: 80, height: 80, borderRadius: 999, position: 'absolute', alignSelf: 'center', bottom: 70 }}
                        buttonStyle={{ flex: 1, backgroundColor: '#fff' }}
                        titleStyle={{ width: 25, height: 25, borderRadius: 999, color: '#58C878', backgroundColor: '#58C878' }}
                        loadingProps={{ size: 28, color: '#58C878' }}
                        title='.'
                        loading={cameraBusy}
                        onPress={handleTakePhoto}

                    />
                </View>
            )}
            {cameraBusy && (
                <Dialog
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    overlayStyle={{ height: '15%', justifyContent: 'center' }}
                    isVisible={cameraBusy}
                >
                    <ActivityIndicator size='large' color='#1E1E1E' />
                </Dialog>
            )}
            {error?.validation && (
                <Dialog
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    isVisible={!!error?.validation}
                    onBackdropPress={() => setError({})}
                >
                    <Dialog.Title title={error?.validation?.title} />
                    <Text>{error?.validation?.message}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3690da', textAlign: 'center', marginEnd: 14, marginTop: 10 }}
                              onPress={() => setError({})}>
                            FECHAR
                        </Text>
                    </View>
                </Dialog>
            )}
            {response?.validation && (
                <Dialog
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    isVisible={!!response?.validation}
                    onBackdropPress={() => setError({})}
                >
                    <Dialog.Title title={response?.validation?.title} />
                    <Text>{response?.validation?.message}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3690da', textAlign: 'center', marginEnd: 14, marginTop: 10 }}
                              onPress={() => setResponse({})}>
                            FECHAR
                        </Text>
                    </View>
                </Dialog>
            )}
        </>
    )
}

export default Camera