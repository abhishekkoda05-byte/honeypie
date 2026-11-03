const express = require("express");
const connect = require("./database/db");
const cors = require("cors");
const register = require("./auth/authentication");
const product = require("./product/product");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", register);
app.use("/product", product);

const port = 3000;

async function  startServer(){
    await connect();
    app.listen(port, () => {
        console.log(`server runing at port ${port}`);
    });
};
startServer();