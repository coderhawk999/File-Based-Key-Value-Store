### Installation


Install the dependencies and devDependencies
```sh
$ npm i
```
### Usage

```js
const Store = require("./index");

// create an instance
const mystore = new Store();
// or 
const mystore = new Store("/path-to-file");

```

### Create functionality

#### `.create( key(type : string,max-length: 32), JSON-data, time-to-live(type: Number), callBack function(optional))`

```js
mystore.create("key",{dat:"JSON-DATA"},timeToLive,()=>{
    // do operation after creating the data
    console.log(mystore.read("key"))
});

// throws Errors :
            // if key-value already exists
            // if invalid json format

```

### Read functionality

#### `.read( key(type : string,max-length: 32) , callBack function(optional))`

```js
mystore.read("key") 

// throws Errors :
            // if key-value does not exists
            // if no key given
            // time-to-live of key-value-data is expired

```

### Delete functionality

#### `.delete( key(type : string,max-length: 32) , callBack function(optional))`

```js
mystore.delete("key",()=>{
    // do operation after deletion
    console.log(mystore.read("key")) //throws error
});
// throws Errors :
            // if key-value does not exists
            // if no key given
            // time-to-live of key-value-data is expired

```

### Mutli Thread Usage


```js
const { Worker, isMainThread } = require('worker_threads');

 try{
        const two = new Worker("./test2.js");
        const one = new Worker("./test1.js");
    }
    catch(err)
    {
        console.log(err)
    }
```
