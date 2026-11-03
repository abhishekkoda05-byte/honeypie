const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB(){
    try{
      await mongoose.connect(process.env.MONGOOSE);
      console.log("mongo db connected successfully");
    }catch(error){
        console.error(error.message || "failer to connect mongodb");
    }
}

module.exports = connectDB;