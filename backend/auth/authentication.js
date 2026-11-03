const user = require("../schema/user");
require("dotenv").config();
const middleware = require("../middlewar/middleware");

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//registration
router.get("/M", middleware, async (req, res) =>{
    try{
      const existinguser = await user.findById(req.user.id);
      if(!existinguser){
        return res.status(401).json({message:"token not found"})
      } 
      return res.status(200).json({message:"created successfully",
         name:existinguser.name, id:existinguser._id})
    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server does not respond"})
    }
})
router.post("/register", async (req, res) => {
    try{
        const { name, email, password } = req.body;
        if(!name || !email || !password){
            return  res.status(400).json({message:"entre all the required details"});
        }
        const exixtinguser = await user.findOne({email});
        if(exixtinguser){
            return res.status(409).json({message:"email already exists"});
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const result = await user.create({
            name:name,
            email:email,
            password:hashedpassword
        });
        return res.status(200).json({message:"created successfully"});

    }catch(error){
   
        console.error(error.message || "server dont found");
       return  res.status(500).json({message:"server did not respond"});
    }
});
//login
router.post("/login", async (req, res) => {
    try{
       const { email, password } = req.body;
       if(!email || !password){
        return res.status(400).json({message:"entre all details"});
       }

       const existinguser = await user.findOne({email});
       if(!existinguser){
        return res.status(404).json({message:"create a account user not found"});

       };

       const userpass = await bcrypt.compare(password, existinguser.password);
       if(!userpass){
        return res.status(401).json({message:"incorrect password"});
       }
       const token = jwt.sign({id:existinguser._id}, process.env.JWT_SECRET, {expiresIn : "1d"});
        return res.status(201).json({message :"login successfully", token ,
             user:{name:existinguser.name, email:existinguser.email, _id:existinguser._id}});
    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server not found"});
    }
})

module.exports = router;

