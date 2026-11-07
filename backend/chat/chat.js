const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const user = require("../schema/user");
const Message = require("../schema/message");
const middleWare = require("../middlewar/middleware");



// Get all conversations of logged-in user
router.get("/conversations", middleWare, async (req, res) => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.user.id);

        // Find all messages involving current user
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { receiver: currentUserId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", currentUserId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);

        // Get the names of people in those conversations
        const partnerIds = conversations.map(item => item._id);

        const people = await user.find({
            _id: { $in: partnerIds }
        }).select("name");

        // Combine user details and latest message
        const inbox = conversations.map(item => {
            const person = people.find(
                p => p._id.toString() === item._id.toString()
            );

            return {
                user: person,
                lastMessage: item.lastMessage
            };
        });

        res.status(200).json({
            message: "Inbox fetched successfully",
            conversations: inbox
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Unable to fetch inbox"
        });
    }
});


//history
router.get("/:userId", middleWare, async (req, res) => {
    try{
       const otherUserId = req.params.userId;
       const currentUserId = req.user.id;

       if(!mongoose.isValidObjectId(otherUserId)){
        return res.status(400).json({message: "invalid user id"});
       };
    
      //checking in compadd
       const otherUser = await user.findById(otherUserId);

       if(!otherUser){
        return res.status(404).json({message:"user not found in compass"});
       };

       const messages = await Message.find({
        $or : [
            {
                sender : currentUserId,
                receiver : otherUserId
            }, 
            {
                sender : otherUserId,
                receiver : currentUserId
            }
        ]
       }).sort({ createdAt : 1});

       res.status(200).json({message:"history updated", messages})
    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server issues"})
    }
});

module.exports = router;