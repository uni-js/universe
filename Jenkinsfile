pipeline {
    agent {
        label 'universe-game-test-server'
    }
    stages {
        stage('Install') { 
            steps {
                sh 'yarn --registry=https://registry.npmmirror.com/'
            }
        }
        stage("Prepare"){
            steps{
                script{
                    build_tag = sh(returnStdout: true, script: 'yarn -s build:version --docker')
                }
                echo "version : ${build_tag}"
            }
        }
        stage('Build') { 
            steps {
                sh "docker build --build-arg server_url=${UNIVERSE_SERVER_URL} -f ./build/Dockerfile.test.client -t universe-js/universe-game-client:${build_tag} ."
                sh "docker build -f ./build/Dockerfile.test.server -t universe-js/universe-game-server:${build_tag} ."
            }
        }
        stage('Deploy') { 
            steps {
                sh "docker rm -f universe-game-client"
                sh "docker rm -f universe-game-server"
                
                sh "docker run --name universe-game-client -p 5000:5000 -d universe-js/universe-game-client:${build_tag}"
                sh "docker run --name universe-game-server -p 6100:6100 -d universe-js/universe-game-server:${build_tag}"
            }
        }
        
    }
}