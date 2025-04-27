pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'truongwf1204'
        DOCKERHUB_PASSWORD = 'Truong@1204'
        SSH_HOST = '46.137.232.177'
        SSH_USERNAME = 'ubuntu'
        SSH_PORT = '22'
        IMAGE_NAME = 'xsmb'
        CONTAINER_NAME = 'xsmb-container'
        DOCKERFILE_PATH = './Dockerfile'
        DOCKER_NETWORK = 'xsmb'
        HOST_PORT = '3000'
        CONTAINER_PORT = '80'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build --platform linux/amd64 -f ${DOCKERFILE_PATH} --no-cache -t ${IMAGE_NAME} ."
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                script {
                    sh "echo ${DOCKERHUB_PASSWORD} | docker login -u ${DOCKERHUB_USERNAME} --password-stdin"
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    sh """
                        docker tag ${IMAGE_NAME} ${DOCKERHUB_USERNAME}/${IMAGE_NAME}
                        docker push ${DOCKERHUB_USERNAME}/${IMAGE_NAME}
                    """
                }
            }
        }

        stage('Deploy to Remote Server') {
            steps {
                sshagent (credentials: ['ec2-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${SSH_USERNAME}@${SSH_HOST} <<EOF
                            echo "${DOCKERHUB_PASSWORD}" | docker login --username ${DOCKERHUB_USERNAME} --password-stdin
                            docker pull ${DOCKERHUB_USERNAME}/${IMAGE_NAME}
                            if [ \$(docker ps -q -f name=${CONTAINER_NAME}) ]; then docker rm -f ${CONTAINER_NAME}; fi
                            if [[ ! "\$(docker images -q ${IMAGE_NAME})" == "" ]]; then docker rmi -f ${IMAGE_NAME}; fi
                            docker tag \$(docker image inspect -f '{{ .ID }}' ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest) ${IMAGE_NAME}
                            if ! docker network inspect "${DOCKER_NETWORK}" >/dev/null 2>&1; then docker network create "${DOCKER_NETWORK}"; fi
                            docker run --name ${CONTAINER_NAME} --env-file /var/opt/be/production/.env -dp ${HOST_PORT}:${CONTAINER_PORT} --network ${DOCKER_NETWORK} ${IMAGE_NAME}
                        EOF
                    """
                }
            }
        }
    }
}
