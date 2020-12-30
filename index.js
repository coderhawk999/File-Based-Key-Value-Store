const fs = require('fs')
var sizeof = require('object-sizeof')
const os = require('os');

var tempPath = os.homedir();


var loadFile = (path)=>{
    try {
        return fs.readFileSync(path, 'utf8')
      } catch (err) {
        throw new Error('Invalid file Path or file does not exist ');
      }
}

 var filePathValidation = (filePath) => {
    if(filePath.length>0)
    {
       //  Checking if given File path exists or no  
        fs.access(filePath, fs.F_OK, (err) => {
            if (err) {
            throw new Error("Invalid file path or file does not exists ")
            }
            else
            {
                return filePath;
            }
        });
    }
    else
    {
        console.log(`File path not provided the file will be created in ${tempPath}`)
    }
}

var Store = function(filePath="")
{
    this.data = {};
    this.filePath = filePathValidation(filePath);

}


// var mystore  = new Store("./test");

module.exports  = Store;