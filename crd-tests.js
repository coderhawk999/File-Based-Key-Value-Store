const Store = require("./index");



console.log("Store without given Path")

const mystore = new Store();

console.log("Store with given Path")

const mystorewithPath = new Store("./data");


// Store create

mystore.create("crd-test",{dat:"test"},0,()=>{
    // do operations after inserting data 
    var value = mystore.read("crd-test")
    console.log(value)
});



// Store delete

// mystore.delete("crd-test",()=>{
//     // do operations after inserting data 
//     var value = mystore.read("crd-test")
//     console.log(value)
// });

// Store Read

// var value = mystore.read("crd-test")
// console.log(value)