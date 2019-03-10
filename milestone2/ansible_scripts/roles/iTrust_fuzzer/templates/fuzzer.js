const fs = require('fs')
const path = require('path');
var Random = require("random-js");
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
                    if(file.split('.')[1]=="yml"){
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

var fuzzerFiles = function(fuzzCount) {
    var fuzzingFiles = getFiles('src/main/java/edu/ncsu/csc/itrust2/');
    for (var i = 0; i < fuzzCount; i++) {
        for (var j = 0; j < fileCount; j++){
            fuzzer(fuzzingFiles[j]);
        }
        execSync(`git add .`);
        execSync(`git commit -m "Git commit after fuzzer tests"`)
        execSync(`java -jar /tmp/jenkins-cli.jar -s http://{{inventory_hostname}}:8080/ build iTrust_Fuzzer -s --username {{jenkins_url_username}} --password {{jenkins_url_password}}|| exit 0`)
        execSync(`git reset --hard HEAD~1`)
        console.log("Fuzz " + (i+1) + " executed")
    }
}


fuzzerFiles (count);