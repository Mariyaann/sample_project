const  mongoose  = require("mongoose");

// const connection = mongoose.connect('mongodb://localhost:27017/pure_qoqo')
const connection = mongoose.connect('mongodb+srv://athiraomanakuttan20:xxkqbkwEyZPE5bKw@cluster0.ybsaf92.mongodb.net/pure_qoqo')
connection.then(()=>console.log("connection successfull")).catch((err)=> console.log(`conncetion failed error : ${err}`))
 
module.exports= {mongoose, connection};