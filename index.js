const fs = require('fs')
const os = require('os');
const lockfile = require('proper-lockfile'); // this package allows to lock the files(for thread safety purpose)

// temporary path if path is not provided

var tempPath = os.homedir()+ '/tmp/data'; 
var dir  = os.homedir()+ '/tmp';


// function to check is given input object is valid or no 

function isEmptyObject(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        return false;
      }
    }
  
    return JSON.stringify(obj) === JSON.stringify({});
  }

// function to load the data from filepath given (returns parsed json data)

var loadFile =  (filePath) => {
    try{
        const filsize = fs.statSync(filePath);
        const fileSizeInBytes = filsize.size;

        if(fileSizeInBytes>1e+9) //  file size contraint (non-functional requirement)
        {
            throw new Error("File size exceeded, file size should be less than 1gb")
        }
        else if(fileSizeInBytes == 0)
        {
            fs.writeFileSync(filePath, JSON.stringify({}));
            return {}
        }
        else
        {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    }
    catch(err)
    {
        console.log(err)
    }
}

// function to validate the given file path (returns path)

var filePathValidation = (filePath, cb ) => {
    try{
            if(filePath.length>0)
            {
                //  Checking if given File path exists or no
                if(!fs.existsSync(filePath))
                {
                    throw new Error("Invalid file path or file does not exists ")
                }
                else
                {
                    return filePath;
                }    
               
            }
            else
            {
                // checking if directory exists

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                    try {
                        fs.writeFileSync(tempPath, JSON.stringify({}))
                        console.log(`File path not provided , Data will be stored at ${tempPath}`)
                        return tempPath;
                    } catch (err) {
                        console.error(err) 
                    }
                }
                else
                {
                    return tempPath;
                }
            }
        }
        catch(err)
        {
            console.log(err)
        }
}
// function to validate the given key


var keyValidation = (key)=>{
    
    if(key == undefined)
    {
        throw new Error("Key is Required");
    }
    if(!(typeof key === 'string')) // key string check
    {
        throw new Error("Invalid Key, should be a String");
    }
    if(key.length == 0 || key.length > 32) // key capped at 32 char contraint
    {
        console.log("Key Size :",key.length)
        throw new Error("Invalid Key, Key size should greator than zero or less than 32 characters in size");
    }

    return true
}

// function to validate data input



var dataValidation = (data)=>{
    var value = data;
    if(!(typeof data === 'object')) // checking input type
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
    if(size >16000)  // data capped at 16KB
    {
        throw new Error("JSON data should be less than 16KB");
    }
    
}

// main Store constructor
var Store = function(filePath="")
{
    try{
        this.locked = true;
        this.filePath = filePathValidation(filePath);
        this.data =loadFile(this.filePath)
    }
    catch(err)
    {
        console.log(err)
    }
  
}

// this function is used to store the data in the file , and lock the file for thread safety

 var storeData =  function(filePath,key,data,timeout){
     return new Promise(resolve =>{
        try{
            const timer = setInterval(async()=>{
                lockfile.lock(filePath)
                .then(async(release) => {
                    // console.log("locking")
                    var fileData = await loadFile(filePath)
                    fileData[key] = data;
                    fs.writeFileSync(filePath, JSON.stringify(fileData));
                    clearInterval(timer);
                    lockfile.unlock(filePath);
                    release
                    resolve(fileData);
                })
                .catch((err)=>{
                    // console.log("Waiting")
                 
                })
            },timeout);   // waiting for data file to unclocked by other process or thread
        }
        catch(err)
        {
            throw new Error("Failed saving data, or file moved or deleted")
        }
     })
}
// this function is used to delete the data in the file , and lock the file for thread safety

var deletData =  function(filePath,key,timeout){
    return new Promise(resolve =>{
       try{
           const timer = setInterval(async()=>{
               lockfile.lock(filePath)
               .then(async(release) => {
                   console.log("locking")
                   var fileData = await loadFile(filePath)
                   delete fileData[key]
                   fs.writeFileSync(filePath, JSON.stringify(fileData));
                   clearInterval(timer);
                   lockfile.unlock(filePath);
                   release
                   resolve(fileData);
               })
               .catch((err)=>{
                   // console.log("Waiting")
                
               })
           },timeout);
       }
       catch(err)
       {
           throw new Error("Failed saving data, or file moved or deleted")
       }
    })
}

// Read functionality -  (expects key as an argument)


Store.prototype.read = function(key)
{
    // key validation
    try{
        keyValidation(key)
            // Check if key exists
            // console.log(this.data)
            if(!(this.data.hasOwnProperty(key)))
            {
                throw new Error("Invalid Key, Key does not exist")
            }

        if(this.data[key][1] !== 0)
        {
            // check expiry(time to live)

            const now = new Date().getTime();
            const key_data = this.data[key];

            if(now > key_data[1])
            {
                throw new Error("time-to-live of '"+ key +"' has been expired")
            }
        }
        else
        {
            return this.data[key];
        }
    }
    catch(err)
    {
        console.log(err)
    }    

}

//  Create functionality -  arguments expected : key,data,time-to-live, callback function



Store.prototype.create = async function(key = "",data = {},timeToLive = 0,cb){
    try{
    // key validation
     keyValidation(key);
        // Check if Key Already Exists
        if(this.data.hasOwnProperty(key))
        {
            throw new Error("Error : Key already Exists");
        }

     // data validation
     dataValidation(data)
     var input_val = [data,0];
     // time to live validation
    if(typeof timeToLive!== "number")
    {
        throw new Error("Time to live must be a Number in seconds");
    }
     if(timeToLive == 0)
     {
         input_val[1] = 0;
     }
     else
     {
         const now = new Date();
         input_val[1] = timeToLive*1000 + now.getTime(); // time to live of the data
     }
     const input_data = input_val;
     this.data = await storeData(this.filePath,key,input_data,10); // store the created Data
     
     console.log("key-value-data has been inserted")

     cb();
    }
    catch(err)
    {
        console.log(err)
    }
}

//  Delete functionality -  arguments expected : key,callback


Store.prototype.delete = async function(key,cb){
     // key validation
     keyValidation(key)
     // Check if key exists
     this.data = loadFile(this.filePath)
     if(!(this.data.hasOwnProperty(key)))
     {
         throw new Error("Invalid Key, Key does not exist")
     }

    if(this.data[key][1] !== 0)
    {
        // check expiry(time to live)

        const now = new Date().getTime();
        const key_data = this.data[key];

        if(now > key_data[1])
        {
            throw new Error("time-to-live of '"+ key +"' has been expired")
        }
    }
    else
    {
        this.data = await deletData(this.filePath,key,10);

        console.log("key-value-data has been deleted")

        cb();
    }    
}

module.exports  = Store;