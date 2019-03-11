const fs = require('fs')
const path = require('path');
var Random = require("random-js");
const child_process = require('child_process')
var http = require('http');

var files= [];
var count=10;
var getFiles= function (dir, done) {
    let files = [];

    fs.readdir(dir, function(err, list) {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, files);

        list.forEach(function(file){
            file = path.resolve(dir, file);

            fs.stat(file, function(err, stat){
                // If directory, execute a recursive call
                if (stat && stat.isDirectory()) {
                    // Add directory to array [comment if you need to remove the directories from the array]
                    if(file.split('.')[1]=="java"){
                    files.push(file);
                    }

                    getFiles(file, function(err, res){


                        files = files.concat(res);
                        
                        
                        if (!--pending) done(null, files);
                    });
                } else {
                    if(file.split('.')[1]=="java"){
                    files.push(file);}

                    if (!--pending) done(null, files);
                }
            });

            
            
        });
        
        
    });
    return files;
};
var fuzzer = 
{
    random : new Random(Random.engines.mt19937().seed(0)),
    
    seed: function (kernel)
    {
        fuzzer.random = new Random(Random.engines.mt19937().seed(kernel));
    },

    mutate:
    {
        string: function(val)
        {
            // MUTATE IMPLEMENTATION HERE
            let lines = fs.readFileSync(val, 'utf8').split(/\r?\n/)
            fs.writeFileSync(val, '', {encoding:'utf8'});
            lines.forEach(function(line)
            {
                if( fuzzer.random.bool(0.05) )
                {
                    line = line.replace('locked', 'closed');
                }
                if( fuzzer.random.bool(0.05) )
                {
                    line = line.replace('<', '>');
                }
            
                if( fuzzer.random.bool(0.25) )
                {
                    line = line.replace('==', '!=')
                }
                if( fuzzer.random.bool(0.25) )
                {
                    line = line.replace('0', '1')
                }

                if(line != '\r')
                line += '\n'

                fs.appendFileSync(val,line);   
        });
    }

}
}

const commitFuzzer = (master_sha1, n) => {
    
    child_process.execSync(`git stash && git checkout fuzzer && git checkout stash -- . && git commit -am "Fuzzing :${master_sha1}: # ${n+1}" && git push`)
    child_process.execSync('git stash drop');
    let lastSha1 = child_process.execSync(`git rev-parse fuzzer`).toString().trim()
    return lastSha1;
}

const reverToFirstCommit = (firstSha1, n) => {
    
    child_process.execSync(`git checkout ${firstSha1}`)
}

const triggerJenkinsBuild = (jenkinsIP, jenkinsToken, githubURL, sha1) => {
    try {
    console.log("\n $$$$$$$$$$$ SHA1: ",sha1);
        console.log("http://${jenkinsIP}:8090/git/notifyCommit?url=${githubURL}&branches=fuzzer&sha1=${sha1}")
        child_process.execSync(`curl "http://${jenkinsIP}:8090/git/notifyCommit?url=${githubURL}&branches=fuzzer&sha1=${sha1}"`)
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
        let javaPaths = getFiles('iTrust2/src/main/java/edu/ncsu/csc/itrust2',function(err,data){
        reverToFirstCommit(sha1)
        javaPaths.forEach(javaPath =>{
            let rnd = Math.random();
            if(rnd > 0.35)
                fuzzer(javaPath);
            });
        })
        let lastSha1 = commitFuzzer(master_sha1, i);
        triggerJenkinsBuild(jenkinsIP, jenkinsToken, githubURL, lastSha1)
    }
}

runFuzzingProcess(1);