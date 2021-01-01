const Store = require("./index");


const mystore = new Store();
mystore.create("dead17",{dat:"test22"},0,()=>{
    console.log(mystore.read("dead17"))
});

