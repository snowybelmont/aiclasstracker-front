import AWS from 'aws-sdk'

const configureRekognition = async () => {
    try {
        AWS.config.update({
            region: process.env.EXPO_PUBLIC_AWS_REGION,
            credentials: new AWS.Credentials(
                String(process.env.EXPO_PUBLIC_AWS_ACESS_KEY),
                String(process.env.EXPO_PUBLIC_AWS_SECRET_KEY)
            )
        })

        return new AWS.Rekognition()
    } catch (error) {
        console.log('Erro ao configurar o rekognition: ', error)
        return null
    }
}

export default configureRekognition