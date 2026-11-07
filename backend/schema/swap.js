const mongoose = require("mongoose");

const swapSchema = new mongoose.Schema({

    requester: {
        type : mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    }, 
owner : {
    type : mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
},
requestedProduct : {
    type: mongoose.Schema.Types.ObjectId,
    ref:"products",
    required:true
},
offeredProduct : {
    type: mongoose.Schema.Types.ObjectId,
    ref:"products",
    required:true
},
status : {
    type :String,
    enum : ["pending", "accepted", "rejected", "completed"],
    default:"pending"
},
requesterConfirmed: {
    type: Boolean,
    default: false
},

ownerConfirmed: {
    type: Boolean,
    default: false
}
 

}, {timestamps: true});

const swap = mongoose.model("swap", swapSchema);

module.exports = swap;