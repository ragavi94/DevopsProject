 
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
var http = require('http');

const triggerBuild = (JENKINS_URL, githubURL, jenkinsToken, sha1) => {
    try {
        child_process.execSync(`curl "http://${JENKINS_URL}:8080/git/notifyCommit?url=${githubURL}&branches=master&sha1=${sha1}"`)
        console.log(`build for master branch deploy triggered:${sha1}`)     
    } catch (error) {
        console.log(`error in build:${sha1}`)
    }
}

const runProcess = (n) => {
    let master_sha1 = process.env.MASTER_SHA1;
    let JENKINS_URL = process.env.JENKINS_IP;
    let jenkinsToken = process.env.JENKINS_BUILD_TOKEN;
    let githubURL = process.env.GITHUB_URL;  
    triggerBuild(JENKINS_URL, githubURL , jenkinsToken, master_sha1)

    
}

runProcess(1);
