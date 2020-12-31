const fs = require('fs')
const os = require('os');

var tempPath = os.homedir()+ '/tmp/data';
var dir  = os.homedir()+ '/tmp';

function isEmptyObject(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        return false;
      }
    }
  
    return JSON.stringify(obj) === JSON.stringify({});
  }
var loadFile = (filePath)=>{
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
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
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            try {
                fs.writeFileSync(tempPath, JSON.stringify({}))
              } catch (err) {
                console.error(err) 
              }
            console.log(`File path not provided , Data will be stored at ${tempPath}`)
            return tempPath;
        }
        else
        {
            return tempPath;
        }
    }
}

var keyValidation = (key)=>{
    
    if(key == undefined)
    {
        throw new Error("Key should be Provided, to create a store");
    }
    if(!(typeof key === 'string'))
    {
        throw new Error("Invalid Key, should be a String");
    }
    if(key.length == 0 || key.length > 32)
    {
        console.log("Key Size :",key.length)
        throw new Error("Valid Key Should be Provided, Key size should greator than zero or less than 32 characters in size");
    }

    return true
}

var dataValidation = (data)=>{
    var value = data;
    if(!(typeof data === 'object'))
    {
        try{
            value = JSON.parse(data);
        }
        catch(err)
        {
            throw new Error("Invalid JSON data")
        }
    }
    if(isEmptyObject(value))
    {
        throw new Error("Empty JSON data");
    }
    const size = Buffer.byteLength(JSON.stringify(value))
    if(size >16000)
    {
        throw new Error("JSON data should be less than 16KB");
    }
    
}


var storeData = (filePath,data)=>{
    try {
        fs.writeFileSync(filePath, JSON.stringify(data))
      } catch (err) {
        throw new Error("Failed while Saving data, File might have been deleted")
      }
}


var Store = function(filePath="")
{
    this.filePath = filePathValidation(filePath);
    this.data = loadFile(this.filePath);
    console.log(this.data)

}

Store.prototype.read = function(key)
{
    keyValidation(key)
}

Store.prototype.create = function(key = "",data = {},timeToLive = 0){
    // key validation
     keyValidation(key);
        // Check if Key Already Exists
        if(this.data.hasOwnProperty(key))
        {
            throw new Error("Key already Exists")   
        }

     // data validation
     dataValidation(data)
     var input_val = [data,0];
     // time to live validation
    if(typeof timeToLive!== "number")
    {
        throw new Error("Titme to live must be a Number in seconds");
    }
     if(timeToLive == 0)
     {
         input_val[1] = 0;
     }
     else
     {
         const now = new Date();
         input_val[1] = timeToLive + now.getTime();
     }
     this.data[key] = input_val;
     storeData(this.filePath,this.data);
}


var mystore  = new Store();

mystore.create("byebye",{data:"Smthing"},0);
module.exports  = Store;