 
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
var http = require('http');


const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
    });
    return filelist;
}

const getAllFilePaths = (dirPath)=>{
    let filePaths = walkSync(dirPath)
    let javaPaths = []

    filePaths.forEach(file => {
        if (!file.match(/models/) && !file.match(/sql/) && path.basename(file).match(/[a-zA-Z0-9._/]+[.]java$/g)) {
            javaPaths.push(file)
        }
    })
    return javaPaths;
}

const fuzzerOps = (filePath) => {
    let lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
    fs.writeFileSync(filePath, '', {encoding:'utf8'});

    var prob=0;
        lines.forEach(function(line){
            prob=Math.random();
            if(prob>0.3)
            {
              if(line.match('while') || line.match('for') || line.match('if'))
              {
                
                if(line.match('<')){
                  line=line.replace('<', '>');
                }
                else if(line.match('>') && !line.match('->')){
                  line=line.replace('>', '<');
                }
    
              }
            }
            prob=Math.random();
            if(prob>0.3){
              if(line.match('=='))
                line=line.replace(/==/g,'!=');
              else if(line.match('!='))
                line=line.replace(/!=/g,'==');
              
            }
            prob=Math.random();
            if(prob>0.5)
            {
              if((line.match('while') || line.match('for') || line.match('if')) && line.match(/[0]/))
              {
                line=line.replace(/[0]/g,"1");
              }
              else if((line.match('while') || line.match('for') || line.match('if')) && line.match('1'))
              { 
                  line=line.replace(/[1]/g,'0');
              }

            }
            prob=Math.random();
            if(prob>0.3)
            {
              if(line.match('for'))
              {
                if(line.match(/\+\+/)){
                  line=line.replace(/\+\+/g, "--");
                }
                else if(line.match("--")){
                  line=line.replace("--", "++");
                }
              }
            }

            prob=Math.random();
            if(prob>0.5)
            {
                if(line.match('true')){
                  line=line.replace('true', 'false');
                }
            }
            else{
                if(line.match('false')){
                  line=line.replace('false', 'true');
                }
            }

            if(line != '\r')
              line += '\n'

            fs.appendFileSync(filePath,line);
    
        });
}

const commit = (master_sha1, n) => {
    
    child_process.execSync(`git stash && git checkout fuzzer && git checkout stash -- . && git commit -am "Fuzzing :${master_sha1}: # ${n+1}" && git push`)
    child_process.execSync('git stash drop');
    let lastSha1 = child_process.execSync(`git rev-parse fuzzer`).toString().trim()
    return lastSha1;
}

const triggerbuild = (JENKINS_URL, jenkinsToken, githubURL, sha1) => {
    try {
        console.log("http://${JENKINS_URL}:5001/git/notifyCommit?url=${githubURL}&branches=fuzzer&sha1=${sha1}")
        child_process.execSync(`curl "http://${JENKINS_URL}:5001/git/notifyCommit?url=${githubURL}&branches=fuzzer&sha1=${sha1}"`)
        console.log(`Succesfully trigger build for fuzzer:${sha1}`)     
    } catch (error) {
        console.log(`Couldn't trigger build for fuzzer:${sha1}`)
    }
}

const runFuzzingProcess = (n) => {
    let flag=1;
    let master_sha1 = process.env.MASTER_SHA1;
    let sha1 = process.env.SHA1;
    let JENKINS_URL = process.env.JENKINS_IP;
    let jenkinsToken = process.env.JENKINS_BUILD_TOKEN;
    let githubURL = process.env.GITHUB_URL;
    for (var i = 0; i < n; i++) {
        let javaPaths = getAllFilePaths('iTrust2/src/main/java/edu/ncsu/csc/itrust2');
        child_process.execSync(`git checkout -f ${sha1}`);
        child_process.execSync(`git checkout fuzzer && git revert ${sha1}  -n -X theirs`)
        child_process.execSync(`git checkout fuzzer && git revert fuzzer~${n-1}  -n -X theirs && git commit -m "revert"`)
        javaPaths.forEach(javaPath =>{
            let rnd = Math.random();
            if(rnd > 0.30)
                fuzzerOps(javaPath);
        })
        let lastSha1 = commit(master_sha1, i);
        triggerbuild(JENKINS_URL, jenkinsToken, githubURL, lastSha1)

    }
}

runFuzzingProcess(2);