 
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
var http = require('http');

const triggerBuild = (JENKINS_URL, githubURL, jenkinsToken, sha1) => {
    try {
        child_process.execSync(`curl "http://${JENKINS_URL}:5001/git/notifyCommit?url=${githubURL}&branches=master&sha1=${sha1}"`)
        console.log(`build for master branch deploy triggered:${sha1}`)     
    } catch (error) {
        console.log(`error in build:${sha1}`)
    }
}

const commit = (master_sha1, n) => {
    
    child_process.execSync(`git stash && git checkout master && git checkout stash -- . && git commit -am "changes to file :${master_sha1}: # ${n+1}" && git push`)
    child_process.execSync('git stash drop');
    let lastSha1 = child_process.execSync(`git rev-parse master`).toString().trim()
    return lastSha1;
}


const runProcess = (n) => {
    let master_sha1 = process.env.MASTER_SHA1;
    let JENKINS_URL = process.env.JENKINS_IP;
    let jenkinsToken = process.env.JENKINS_BUILD_TOKEN;
    let githubURL = process.env.GITHUB_URL;

    let lastSha1 = commit(master_sha1, i);
    triggerBuild(JENKINS_URL, githubURL , jenkinsToken, lastSha1)

    
}

runProcess(1);
