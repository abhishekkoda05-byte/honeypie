const mongoose = require("mongoose");

const userdetails = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
   email:  {
        type:String,
        required:true,
        unique : true
    } ,
    password : {
       type : String,
       required:true,
    },
    profileImage : {
        type:String,
        default :""
    },
    location : {
        type : String,
        default :""
    } ,
     bio : {
        type : String,
        default :""
     }

},
    { timestamps: true }
);

const user = mongoose.model("user", userdetails);

module.exports = user;