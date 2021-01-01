const Store = require("./index");


const mystore = new Store();
mystore.create("dead13",{dat:"test22"},0,()=>{
    console.log(mystore.read("dead13"))
});

