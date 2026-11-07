const mongoose = require("mongoose");

const product = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

      size: {
        type: String,
        required: true
    },

      brand: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    images: [
        {
            imageUrl: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            }
        }
    ],

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    available : {
        type : Boolean ,
        default : true
    }
});

const productdetails = mongoose.model("products", product);

module.exports = productdetails;