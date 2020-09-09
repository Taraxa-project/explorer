pipeline {
    agent any
    environment {
        IMAGE = 'taraxa/explorer'
        SLACK_CHANNEL = 'jenkins'
        SLACK_TEAM_DOMAIN = 'phragmites'
    }
    options {
      ansiColor('xterm')
      disableConcurrentBuilds()
    }
    stages {
        stage('Docker-Hub Registry Login') {
            steps {
                withCredentials([string(credentialsId: 'docker_hub_taraxa_pass', variable: 'HUB_PASS')]) {
                  sh 'echo ${HUB_PASS} | docker login -u taraxa --password-stdin'
                }
            }
        }
        stage('Build Docker Image') {
            when {branch 'master'}
            steps {
                sh 'docker build -t ${IMAGE}:latest -f Dockerfile .'
            }
        }
        stage('Push Docker Image') {
            when {branch 'master'}
            steps {
                sh 'docker tag ${IMAGE}:latest ${IMAGE}:$(grep -m1 version package.json | awk -F: \'{ print $2 }\' | sed \'s/[", ]//g\')-${BUILD_NUMBER}'
                sh 'docker push ${IMAGE}:$(grep -m1 version package.json | awk -F: \'{ print $2 }\' | sed \'s/[", ]//g\')-${BUILD_NUMBER}'
                sh 'docker push ${IMAGE}:latest'
            }
        }
    }
post {
    always {
        cleanWs()
    }
    success {
      slackSend (channel: "${SLACK_CHANNEL}", teamDomain: "${SLACK_TEAM_DOMAIN}", tokenCredentialId: 'SLACK_TOKEN_ID',
                color: '#00FF00', message: "SUCCESSFUL: Job '${JOB_NAME} [${BUILD_NUMBER}]' (${BUILD_URL})")
    }
    failure {
      slackSend (channel: "${SLACK_CHANNEL}", teamDomain: "${SLACK_TEAM_DOMAIN}", tokenCredentialId: 'SLACK_TOKEN_ID',
                color: '#FF0000', message: "FAILED: Job '${JOB_NAME} [${BUILD_NUMBER}]' (${BUILD_URL})")
    }
  }
}
