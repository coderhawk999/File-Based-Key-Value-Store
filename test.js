const Store = require("./index");
const { Worker, isMainThread } = require('worker_threads');


if (isMainThread) {
    console.log('Inside Main Thread!');
    
    // This re-loads the current file inside a Worker instance.
    try{
        const two = new Worker("./test2.js");
        const one = new Worker("./test1.js");
    }
    catch(err)
    {
        console.log(err)
    }

  } else {
    console.log('Inside Worker Thread!');
    console.log(isMainThread);  // Prints 'false'.
  }