var fs = require('fs'),
xml2js = require('xml2js'),
child  = require('child_process'); 
var HashMap = require('hashmap');
var parser = new xml2js.Parser();
var Bluebird = require('bluebird');
const path = require('path');

const dir = '/home/vagrant/fuzzer_test_reports/';
var totalLen =1;
fs.readdir(dir, (err, files) => {
  totalLen = files.length;
});

var hashmap = new HashMap();

const walkSync = (dir, filepaths = []) => {
    fs.readdirSync(dir).forEach(file => {
        filepaths = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filepaths)
            : filepaths.concat(path.join(dir, file));
    });
    return filepaths;
}

let filePaths = walkSync('/home/vagrant/fuzzer_test_reports/');
read(filePaths);

function read(filePaths) {

       filePaths.forEach(function(filename) {

           if(filename.endsWith(".xml")){
 
     Priority(filename);
     }
       });

     setTimeout(func, 15000);
 }

 async function Priority(filePath)
 {
 
 var contents = fs.readFileSync(filePath)
 let xml2json = await Bluebird.fromCallback(cb => parser.parseString(contents, cb));
 var tests = fileParse(xml2json);
 
 
 for(var x = 0; x<tests.length; x++){
     if(!hashmap.has(tests[x].name)){
         if(tests[x].status == "passed"){
             hashmap.set(tests[x].name,  [1, 0]);
         }
             
         else
         hashmap.set(tests[x].name,  [0, tests[x].time]);
             
     }else{
         var object = hashmap.get(tests[x].name);
         var passCount = object[0];
         var totalTime = object[1];
   
         
         if(tests[x].status == "passed"){
             passCount = passCount+1;
                      
         }else{
             
             totalTime = totalTime + tests[x].time;
         }
         
         hashmap.set(tests[x].name, [passCount, totalTime]);
 
     
     }
 }
 
 }


function func(){
    var array= [];
    
    hashmap.forEach(function(value,key){
    array.push({
        name: key,
        value: value
});
});

var s_arr = array.sort(function(a,b){
    if((a.value)[0] == (b.value)[0]){
        if((a.value)[1] > (b.value)[1])
            return 1;
        else
            return -1;
    }else if((a.value)[0] > (b.value)[0]){
        return 1;
    }else if((a.value)[0] < (b.value)[0]) {
        return -1;
    }
});

let content = "\n ------------------------------Test prioritization analysis--------------------------- \n\n";

for (var x in s_arr){
var no_failed = totalLen - ((s_arr[x].value)[0]);
var upper = ((s_arr[x].value)[1]);
var avg_time = (no_failed==0)?0:(upper/no_failed);
console.log("Test Name : "+(s_arr[x].name)+ " || No of times failed: "+(no_failed)+" || time is: "+(avg_time));
content+="Test Name : "+(s_arr[x].name)+ " || No of times failed: "+(no_failed)+" || time is: "+(avg_time)+'\n';

}
fs.writeFileSync("report.txt", content, "utf8");
}



function fileParse(result)
{
    var tests = [];
    for( var i = 0; i < result.testsuite['$'].tests; i++ )
    {
        var testcase = result.testsuite.testcase[i];
        
        tests.push({
        name:   testcase['$'].name, 
        time:   parseFloat(testcase['$'].time), 
        status: testcase.hasOwnProperty('failure') ? "failed": "passed"
        });
    }    
    return tests;
}


