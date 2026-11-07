const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const Message = mongoose.model("message", messageSchema);

module.exports = Message;