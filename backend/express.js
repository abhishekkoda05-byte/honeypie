const express = require("express");
const connect = require("./database/db");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const mongoose = require("mongoose");


const register = require("./auth/authentication");
const Message = require("./schema/message")
const product = require("./product/product");
const swap = require("./product/swap");
const chat = require("./chat/chat");
const user = require("./schema/user");

const app = express();


app.use(cors());
app.use(express.json());

//health check for render and cron-job
app.get("/health", (req, res) => {
   try{
     res.status(200).json({
        status:"ok",
        message:"honeypie is running"
    })
   }catch(error){
    console.error(error.message);
   }
})


app.use("/api/auth", register);
app.use("/product", product);
app.use("/swap", swap);
app.use("/chat", chat);

//creating an ios server 
const server = http.createServer(app);
//attach socket.io
const io = new Server(server, {
    cors : {
        origin : "*",
        methods : ["GET", "POST"]
    }
});
//authentication 
io.use((socket, next) => {
    try{
     const token = socket.handshake.auth.token;
     if(!token){
        return next(new Error("token required"));
     }
     const decoded = jwt.verify(token, process.env.JWT_SECRET);

     socket.userId = decoded.id;

     next();
    }catch(error){
        console.error(error.message);
        next(new Error("authentication failed "))
    }
})
//detect user is connected or not 
io.on("connection", (socket) => {
    console.log("user connected", socket.userId);

    socket.join(String(socket.userId));
    console.log("user joined private room", socket.userId);

    socket.on("send_message", async (data, callback) => {
      try{
        const senderId = socket.userId;
        const receiverId = data.receiverId;
        const messagetext = data.message?.trim();

        if(!mongoose.isValidObjectId(receiverId)){
            return callback?.({
                success:false,
                message:"invalid receiver ID"
            });
        }
        if(String(senderId) === String(receiverId)){
            return callback?.({
                success:false,
                message:"cannot message urself"
            });
        }
           if(!messagetext || messagetext.length > 2000){
                return callback?.({
                    success:false,
                    message:"invalid message"
                })
            }
            const receiver = await user.findById(receiverId);

            if(!receiver){
                return callback?.({
                    success:false,
                    messsage:"reeceiver not found"
                })
            };
            const newmessage = await Message.create({
                sender:senderId,
                receiver:receiverId,
                message:messagetext
            });
            io.to(String(receiverId)).emit("receive_message", newmessage);
            io.to(String(senderId)).emit("receive_message", newmessage);

            callback?.({
                success:true,
                message:"message sent",
                data:newmessage
            })
      }catch(error){
        console.error(error.message);
        callback?.({
            success:false,
            message:"message sending failed"
        })
      }
    });

    socket.on("disconnect", () => {
        console.log("user disconnected : ", socket.userId );
    })
});

const port = process.env.PORT || 3000;

async function  startServer(){
    await connect();

    server.listen(port, () => {
        console.log(`server runing at port ${port}`);
    });
};
startServer();