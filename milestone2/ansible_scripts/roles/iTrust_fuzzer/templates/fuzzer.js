 
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

const getJavaFilePaths = (dirPath)=>{
    let filePaths = walkSync(dirPath)
    let javaPaths = []

    filePaths.forEach(file => {
        if (!file.match(/models/) && !file.match(/sql/) && path.basename(file).match(/[a-zA-Z0-9._/]+[.]java$/g)) {
            javaPaths.push(file)
        }
    })
    return javaPaths;
}

const fileFuzzer = (filePath) => {
    let lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
    fs.writeFileSync(filePath, '', {encoding:'utf8'});

    var prob=0;
        lines.forEach(function(line){
            prob=Math.random();
            if(prob>0.4)
            {
              if(line.match('while') || line.match('for') || line.match('if'))
              {
                
                if(line.match('<')){
                  line=line.replace('<', '>');
                }
                else if(line.match('>') && !line.match('->')){
                  line=line.replace('>', '<');
                }
<<<<<<< HEAD
    
              }
            }
            prob=Math.random();
            if(prob>0.4){
              if(line.match('=='))
                line=line.replace(/==/g,'!=');
              else if(line.match('!='))
                line=line.replace(/!=/g,'==');
              
            }
            prob=Math.random();
            if(prob>0.4)
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
            if(prob>0.4)
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
            if(prob>0.4)
            {
                if(line.match('true')){
                  line=line.replace('true', 'false');
                }
            }
            else{
                if(line.match('false')){
                  line=line.replace('false', 'true');
=======
            });

            
            
        });
        
        
    });
    return files;

};
var random = function () {
    return new Random(Random.engines.mt19937().autoSeed())
}
var fuzzer = 
{


    mutate:
    {
        string: function(val)
        {
            // MUTATE IMPLEMENTATION HERE
            let lines = fs.readFileSync(val, 'utf8').split(/\r?\n/)
            fs.writeFileSync(val, '', {encoding:'utf8'});
            lines.forEach(function(line)
            {
                if( random().bool(0.05) )
                {
                    line = line.replace('locked', 'closed');
                }
                if( random().bool(0.05) )
                {
                    line = line.replace('<', '>');
                }
            
                if( random().bool(0.25) )
                {
                    line = line.replace('==', '!=')
                }
                if( random().bool(0.25) )
                {
                    line = line.replace('0', '1')
>>>>>>> 3b312feb48111079cb60f99276879e576f0eb325
                }
            }

            if(line != '\r')
              line += '\n'

            fs.appendFileSync(filePath,line);
    
        });
}

const commitFuzzer = (master_sha1, n) => {
    
    child_process.execSync(`git stash && git checkout fuzzer && git checkout stash -- . && git commit -am "Fuzzing :${master_sha1}: # ${n+1}" && git push`)
    child_process.execSync('git stash drop');
    let lastSha1 = child_process.execSync(`git rev-parse fuzzer`).toString().trim()
    return lastSha1;
}

const triggerJenkinsBuild = (JENKINS_URL, jenkinsToken, githubURL, sha1) => {
    try {
        console.log("http://${JENKINS_URL}:5001/git/notifyCommit?url=${githubURL}&branches=fuzzer&sha1=${sha1}")
        child_process.execSync(`curl "http://${JENKINS_URL}:5001/git/notifyCommit?url=${githubURL}&branches=fuzzer&sha1=${sha1}"`)
        console.log(`Succesfully trigger build for fuzzer:${sha1}`)
    } catch (error) {
        console.log(`Couldn't trigger build for fuzzer:${sha1}`)
    }
}

const runFuzzingProcess = (n) => {
    let master_sha1 = process.env.MASTER_SHA1;
    let sha1 = process.env.SHA1;
    let jenkinsIP = process.env.JENKINS_IP;
    let jenkinsToken = process.env.JENKINS_BUILD_TOKEN;
    let githubURL = process.env.GITHUB_URL;
    for (var i = 0; i < n; i++) {
        let javaPaths = getJavaFilePaths('iTrust2/src/main/java/edu/ncsu/csc/itrust2');
        child_process.execSync(`git checkout -f ${sha1}`);
        javaPaths.forEach(javaPath =>{
            let rnd = Math.random();
            if(rnd > 0.25)
                fileFuzzer(javaPath);
        })
        let lastSha1 = commitFuzzer(master_sha1, i);
        triggerJenkinsBuild(jenkinsIP, jenkinsToken, githubURL, lastSha1)
    }
}

runFuzzingProcess(2);