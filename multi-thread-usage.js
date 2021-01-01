const { Worker, isMainThread } = require('worker_threads');

if (isMainThread) {
   
    try{
        const two = new Worker("./test2.js");
        const one = new Worker("./test1.js");
    }
    catch(err)
    {
        // console.log(err)
    }

  } else {
   
  }